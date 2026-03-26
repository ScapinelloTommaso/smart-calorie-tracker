using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartCalorieTracker.Api.Data;
using SmartCalorieTracker.Api.Models;

namespace SmartCalorieTracker.Api.Services;

public class FoodProcessingService : IFoodProcessingService
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public FoodProcessingService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
    {
        _context = context;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<FoodDictionary> AnalyzeFoodAsync(string userInput)
    {
        var normalizedInput = userInput.ToLower().Trim();

        var existingFood = await _context.FoodDictionaries
            .FirstOrDefaultAsync(f => f.FoodName == normalizedInput);

        if (existingFood != null)
        {
            return existingFood;
        }

        var apiKey = _configuration["Groq:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "system", content = "Sei un nutrizionista. RISPONDI SOLO ED ESCLUSIVAMENTE CON UN OGGETTO JSON. NON SCRIVERE NESSUNA PAROLA PRIMA O DOPO LE PARENTESI GRAFFE. I valori per Calories, Proteins, Carbs e Fats devono essere ESCLUSIVAMENTE NUMERI INTERI O DECIMALI. Non aggiungere MAI unità di misura come 'g', 'gr' o 'kcal'. Esempio corretto: {\"FoodName\": \"mela\", \"CaloriesPer100g\": 52, \"ProteinsPer100g\": 0.3, \"CarbsPer100g\": 14, \"FatsPer100g\": 0.2}." },
                new { role = "user", content = normalizedInput }
            },
            response_format = new { type = "json_object" }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);

        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseString);
        var messageContent = jsonDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "{}";

        var match = System.Text.RegularExpressions.Regex.Match(messageContent, @"\{[\s\S]*\}");
        string cleanJson = match.Success ? match.Value : messageContent;
        cleanJson = System.Text.RegularExpressions.Regex.Replace(cleanJson, @"(\d+)\s*(g|gr|kcal)\b", "$1", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString 
        };
        var parsedData = JsonSerializer.Deserialize<GroqFoodResponse>(cleanJson, options);

        if (parsedData == null || string.IsNullOrEmpty(parsedData.FoodName))
        {
            throw new Exception("Impossibile analizzare il cibo.");
        }

        var newFood = new FoodDictionary
        {
            FoodName = normalizedInput,
            CaloriesPer100g = parsedData.CaloriesPer100g,
            ProteinsPer100g = parsedData.ProteinsPer100g,
            CarbsPer100g = parsedData.CarbsPer100g,
            FatsPer100g = parsedData.FatsPer100g
        };

        _context.FoodDictionaries.Add(newFood);
        await _context.SaveChangesAsync();

        return newFood;
    }

    private class GroqFoodResponse
    {
        public string FoodName { get; set; } = string.Empty;
        public double CaloriesPer100g { get; set; }
        public double ProteinsPer100g { get; set; }
        public double CarbsPer100g { get; set; }
        public double FatsPer100g { get; set; }
    }
}
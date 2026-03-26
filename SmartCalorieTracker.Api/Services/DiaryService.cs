using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SmartCalorieTracker.Api.Data;
using SmartCalorieTracker.Api.DTOs;
using SmartCalorieTracker.Api.Models;

namespace SmartCalorieTracker.Api.Services;

public class DiaryService : IDiaryService
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IFoodProcessingService _foodProcessingService;
    private readonly IConfiguration _configuration;

    public DiaryService(AppDbContext context, HttpClient httpClient, IFoodProcessingService foodProcessingService, IConfiguration configuration)
    {
        _context = context;
        _httpClient = httpClient;
        _foodProcessingService = foodProcessingService;
        _configuration = configuration;
    }

    public async Task<DiaryResponseDto> AddEntryAsync(Guid userId, string userInput, string mealType, DateTime? date = null)
    {
        var apiKey = _configuration["Groq:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "system", content = "Sei un estrattore dati nutrizionali. RISPONDI SOLO ED ESCLUSIVAMENTE CON UN OGGETTO JSON. NON SCRIVERE NESSUNA PAROLA PRIMA O DOPO LE PARENTESI GRAFFE. Rispondi SOLO con un JSON contenente ESATTAMENTE queste due chiavi in inglese: 'FoodName' (stringa, nome del pasto aggregato) e 'Grams' (numero, quantità totale in grammi senza 'g' o 'gr'). Esempio corretto: {\"FoodName\": \"pasta e mela\", \"Grams\": 150}. NON aggiungere unità di misura ai numeri. Se i grammi mancano, stima un peso sensato e somma tutto." },
                new { role = "user", content = userInput }
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
            .GetString();

        var sanitized = SanitizeJsonResponse(messageContent ?? "{}");
        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString 
        };
        var extraction = JsonSerializer.Deserialize<ExtractionResponse>(sanitized, options);

        if (extraction == null || string.IsNullOrEmpty(extraction.FoodName))
        {
            throw new Exception("Impossibile estrarre cibo e quantità.");
        }

        var foodDictionary = await _foodProcessingService.AnalyzeFoodAsync(extraction.FoodName);

        var caloriesConsumed = (foodDictionary.CaloriesPer100g / 100.0) * extraction.Grams;
        var proteinsConsumed = (foodDictionary.ProteinsPer100g / 100.0) * extraction.Grams;
        var carbsConsumed = (foodDictionary.CarbsPer100g / 100.0) * extraction.Grams;
        var fatsConsumed = (foodDictionary.FatsPer100g / 100.0) * extraction.Grams;

        // Fetch user to snapshot current targets
        var user = await _context.Users.FindAsync(userId);

        var dailyLog = new DailyLog
        {
            UserId = userId,
            FoodDictionaryId = foodDictionary.Id,
            Date = date?.Date ?? DateTime.UtcNow.Date,
            GramsConsumed = extraction.Grams,
            MealType = mealType,
            TargetCalories = user?.DailyCalorieGoal ?? 2000,
            TargetProteins = user?.DailyProteinGoal ?? 150,
            TargetCarbs = user?.DailyCarbsGoal ?? 200,
            TargetFats = user?.DailyFatsGoal ?? 60
        };

        _context.DailyLogs.Add(dailyLog);
        await _context.SaveChangesAsync();
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;
        var todayTotals = await GetTotalsByDateAsync(userId, targetDate);


        return new DiaryResponseDto
        {
            Messaggio = "Pasto registrato con successo e appresa nuova AI cache!",
            Pasto = foodDictionary.FoodName,
            Quantita = $"{extraction.Grams}g",
            MealType = mealType,
            CalorieDelPasto = Math.Round(caloriesConsumed, 0),
            ProteineDelPasto = Math.Round(proteinsConsumed, 0),
            CarboidratiDelPasto = Math.Round(carbsConsumed, 0),
            GrassiDelPasto = Math.Round(fatsConsumed, 0),
            TotaleCalorieOggi = Math.Round(todayTotals.Calories, 0),
            TotaleProteineOggi = Math.Round(todayTotals.Proteins, 0),
            TotaleCarboidratiOggi = Math.Round(todayTotals.Carbs, 0),
            TotaleGrassiOggi = Math.Round(todayTotals.Fats, 0)
        };
    }

    public async Task<(double Calories, double Proteins, double Carbs, double Fats, double TargetCalories, double TargetProteins, double TargetCarbs, double TargetFats)> GetTotalsByDateAsync(Guid userId, DateTime date)
    {
        var logs = await _context.DailyLogs
            .Include(d => d.FoodDictionary)
            .Where(d => d.UserId == userId && d.Date.Date == date.Date)
            .ToListAsync();

        double totalCalories = 0;
        double totalProteins = 0;
        double totalCarbs = 0;
        double totalFats = 0;

        foreach (var l in logs)
        {
            totalCalories += (l.FoodDictionary.CaloriesPer100g / 100) * l.GramsConsumed;
            totalProteins += (l.FoodDictionary.ProteinsPer100g / 100) * l.GramsConsumed;
            totalCarbs += (l.FoodDictionary.CarbsPer100g / 100) * l.GramsConsumed;
            totalFats += (l.FoodDictionary.FatsPer100g / 100) * l.GramsConsumed;
        }

        // Get targets from the first log of the day (snapshot), or fall back to user globals
        double targetCal, targetProt, targetCarb, targetFat;

        if (logs.Any())
        {
            var firstLog = logs.First();
            targetCal = firstLog.TargetCalories;
            targetProt = firstLog.TargetProteins;
            targetCarb = firstLog.TargetCarbs;
            targetFat = firstLog.TargetFats;

            // If targets are 0 (old logs before migration), fall back to user globals
            if (targetCal == 0)
            {
                var user = await _context.Users.FindAsync(userId);
                targetCal = user?.DailyCalorieGoal ?? 2000;
                targetProt = user?.DailyProteinGoal ?? 150;
                targetCarb = user?.DailyCarbsGoal ?? 200;
                targetFat = user?.DailyFatsGoal ?? 60;
            }
        }
        else
        {
            var user = await _context.Users.FindAsync(userId);
            targetCal = user?.DailyCalorieGoal ?? 2000;
            targetProt = user?.DailyProteinGoal ?? 150;
            targetCarb = user?.DailyCarbsGoal ?? 200;
            targetFat = user?.DailyFatsGoal ?? 60;
        }

        return (
            Math.Round(totalCalories, 0),
            Math.Round(totalProteins, 0),
            Math.Round(totalCarbs, 0),
            Math.Round(totalFats, 0),
            targetCal,
            targetProt,
            targetCarb,
            targetFat
        );
    }

    public async Task<IEnumerable<object>> GetLogsByDateAsync(Guid userId, DateTime date)
    {
        var logs = await _context.DailyLogs
            .Include(d => d.FoodDictionary)
            .Where(d => d.UserId == userId && d.Date.Date == date.Date)
            .OrderByDescending(d => d.Id)
            .ToListAsync();

        return logs.Select(l => new 
        {
            Id = l.Id,
            Name = l.FoodDictionary.FoodName,
            Calories = Math.Round((l.FoodDictionary.CaloriesPer100g / 100) * l.GramsConsumed, 0),
            Grams = $"{l.GramsConsumed}g",
            MealType = l.MealType
        });
    }

    public async Task<IEnumerable<object>> GetMonthSummaryAsync(Guid userId, int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var user = await _context.Users.FindAsync(userId);
        var goal = user?.DailyCalorieGoal ?? 2000;

        var logs = await _context.DailyLogs
            .Include(d => d.FoodDictionary)
            .Where(d => d.UserId == userId && d.Date.Date >= startDate && d.Date.Date <= endDate)
            .ToListAsync();

        var grouped = logs.GroupBy(l => l.Date.Date)
            .Select(g => new
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                TotalCalories = Math.Round(g.Sum(x => (x.FoodDictionary.CaloriesPer100g / 100.0) * x.GramsConsumed), 0),
                // Use snapshot target if available, otherwise user global
                GoalCalories = g.First().TargetCalories > 0 ? g.First().TargetCalories : goal
            });

        return grouped;
    }

    public async Task DeleteEntryAsync(Guid userId, int logId)
    {
        var log = await _context.DailyLogs.FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId);
        if (log == null) throw new Exception("Log non trovato.");

        _context.DailyLogs.Remove(log);
        await _context.SaveChangesAsync();
    }

    public async Task<DiaryResponseDto> UpdateEntryAsync(Guid userId, int logId, string userInput, string mealType)
    {
        var log = await _context.DailyLogs.FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId);
        if (log == null) throw new Exception("Log non trovato.");

        var apiKey = _configuration["Groq:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        
        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "system", content = "Sei un nutrizionista. RISPONDI SOLO ED ESCLUSIVAMENTE CON UN OGGETTO JSON. NON SCRIVERE NESSUNA PAROLA PRIMA O DOPO LE PARENTESI GRAFFE. I valori per Calories, Proteins, Carbs, Fats e Grams devono essere ESCLUSIVAMENTE NUMERI. Non aggiungere MAI unità di misura. Esempio corretto: {\"FoodName\": \"mela\", \"CaloriesPer100g\": 52, \"ProteinsPer100g\": 0.3, \"CarbsPer100g\": 14, \"FatsPer100g\": 0.2, \"Grams\": 150}." },
                new { role = "user", content = userInput }
            },
            response_format = new { type = "json_object" }
        };

        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);

        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = System.Text.Json.JsonDocument.Parse(responseString);
        var messageContent = jsonDoc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        var sanitizedUpdate = SanitizeJsonResponse(messageContent ?? "{}");
        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString 
        };
        var extraction = System.Text.Json.JsonSerializer.Deserialize<ExtractionResponse>(sanitizedUpdate, options);
        if (extraction == null) throw new Exception("Ai failure");

        var normalizedInput = extraction.FoodName.ToLower().Trim();
        var foodDictionary = await _context.FoodDictionaries.FirstOrDefaultAsync(f => f.FoodName.ToLower() == normalizedInput);

        if (foodDictionary == null)
        {
            foodDictionary = new FoodDictionary
            {
                FoodName = extraction.FoodName,
                CaloriesPer100g = extraction.CaloriesPer100g,
                ProteinsPer100g = extraction.ProteinsPer100g,
                CarbsPer100g = extraction.CarbsPer100g,
                FatsPer100g = extraction.FatsPer100g
            };
            _context.FoodDictionaries.Add(foodDictionary);
            await _context.SaveChangesAsync();
        }

        log.FoodDictionaryId = foodDictionary.Id;
        log.GramsConsumed = extraction.Grams;
        log.MealType = mealType;
        await _context.SaveChangesAsync();

        var caloriesConsumed = (foodDictionary.CaloriesPer100g / 100) * extraction.Grams;
        var proteinsConsumed = (foodDictionary.ProteinsPer100g / 100) * extraction.Grams;
        var carbsConsumed = (foodDictionary.CarbsPer100g / 100) * extraction.Grams;
        var fatsConsumed = (foodDictionary.FatsPer100g / 100) * extraction.Grams;

        var todayTotals = await GetTotalsByDateAsync(userId, log.Date.Date);

        return new DiaryResponseDto
        {
            Messaggio = "Pasto modificato con successo!",
            Pasto = foodDictionary.FoodName,
            Quantita = $"{extraction.Grams}g",
            MealType = mealType,
            CalorieDelPasto = Math.Round(caloriesConsumed, 0),
            ProteineDelPasto = Math.Round(proteinsConsumed, 0),
            CarboidratiDelPasto = Math.Round(carbsConsumed, 0),
            GrassiDelPasto = Math.Round(fatsConsumed, 0),
            TotaleCalorieOggi = Math.Round(todayTotals.Calories, 0),
            TotaleProteineOggi = Math.Round(todayTotals.Proteins, 0),
            TotaleCarboidratiOggi = Math.Round(todayTotals.Carbs, 0),
            TotaleGrassiOggi = Math.Round(todayTotals.Fats, 0)
        };
    }

    /// <summary>
    /// Strips markdown fences and extracts only the JSON object from AI responses.
    /// </summary>
    private static string SanitizeJsonResponse(string raw)
    {
        var match = System.Text.RegularExpressions.Regex.Match(raw, @"\{[\s\S]*\}");
        string cleanJson = match.Success ? match.Value : raw;
        
        // Remove units only when they immediately follow digits, preventing replacement in words like "formaggio"
        return System.Text.RegularExpressions.Regex.Replace(cleanJson, @"(\d+)\s*(g|gr|kcal)\b", "$1", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }

    public async Task<string> SuggestMealAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new Exception("Utente non trovato.");

        var today = DateTime.UtcNow.Date;
        var totals = await GetTotalsByDateAsync(userId, today);

        var remainingCal = Math.Max(0, totals.TargetCalories - totals.Calories);
        var remainingProt = Math.Max(0, totals.TargetProteins - totals.Proteins);
        var remainingCarbs = Math.Max(0, totals.TargetCarbs - totals.Carbs);
        var remainingFats = Math.Max(0, totals.TargetFats - totals.Fats);

        var apiKey = _configuration["Groq:ApiKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = "llama-3.1-8b-instant",
            messages = new[]
            {
                new { role = "system", content = $"Sei un nutrizionista italiano esperto e motivante. All'utente mancano esattamente {remainingCal:F0} kcal, {remainingProt:F0}g proteine, {remainingCarbs:F0}g carboidrati, {remainingFats:F0}g grassi per completare la giornata. Suggerisci un singolo pasto delizioso e realistico che si avvicini il più possibile a questi valori. Sii conciso (massimo 3-4 frasi), scrivi in italiano, usa un tono incoraggiante e descrivi brevemente il pasto con gli ingredienti principali. NON includere tabelle o JSON, solo testo discorsivo." },
                new { role = "user", content = "Cosa dovrei mangiare per completare la mia giornata?" }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseString);
        var suggestion = jsonDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return suggestion ?? "Non riesco a generare un suggerimento al momento. Riprova più tardi!";
    }

    public async Task<IEnumerable<string>> GetKnownFoodsAsync(Guid userId)
    {
        // Get all unique food names from the user's historical diary entries
        var foodNames = await _context.DailyLogs
            .Where(d => d.UserId == userId)
            .Select(d => d.FoodDictionary.FoodName)
            .Distinct()
            .ToListAsync();

        // Split food names into individual keywords for matching
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "di", "con", "al", "alla", "alle", "ai", "agli", "del", "della", "delle",
            "dei", "degli", "in", "e", "o", "un", "una", "uno", "il", "la", "le", "lo", "gli", "i"
        };

        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var name in foodNames)
        {
            // Add the full food name as-is
            if (!string.IsNullOrWhiteSpace(name))
                keywords.Add(name.Trim().ToLower());

            // Also add individual words if multi-word
            var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var w in words)
            {
                var word = w.Trim().ToLower();
                if (word.Length > 2 && !stopWords.Contains(word))
                    keywords.Add(word);
            }
        }

        return keywords.OrderBy(k => k);
    }

    public async Task<IEnumerable<object>> GetKnownFoodsDetailsAsync(Guid userId)
    {
        var foods = await _context.DailyLogs
            .Where(d => d.UserId == userId)
            .Include(d => d.FoodDictionary)
            .GroupBy(d => d.FoodDictionary.FoodName)
            .Select(g => new
            {
                Name = g.Key.ToLower(),
                Calories = Math.Round(g.First().FoodDictionary.CaloriesPer100g, 1),
                Proteins = Math.Round(g.First().FoodDictionary.ProteinsPer100g, 1),
                Carbs = Math.Round(g.First().FoodDictionary.CarbsPer100g, 1),
                Fats = Math.Round(g.First().FoodDictionary.FatsPer100g, 1)
            })
            .ToListAsync();

        return foods;
    }

    private class ExtractionResponse
    {
        public string FoodName { get; set; } = string.Empty;
        public double CaloriesPer100g { get; set; }
        public double ProteinsPer100g { get; set; }
        public double CarbsPer100g { get; set; }
        public double FatsPer100g { get; set; }
        public double Grams { get; set; }
    }
}


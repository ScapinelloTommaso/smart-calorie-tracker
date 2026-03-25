using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace SmartCalorieTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OnboardingController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OnboardingController(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public class CalculateMacrosRequest
    {
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public double Height { get; set; }
        public double Weight { get; set; }
        public string Activity { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
    }

    [HttpPost("calculate-macros")]
    public async Task<IActionResult> CalculateMacros([FromBody] CalculateMacrosRequest request)
    {
        try
        {
            var apiKey = _configuration["Groq:ApiKey"];
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var prompt = $"Età: {request.Age}, Sesso: {request.Gender}, Altezza: {request.Height}cm, Peso: {request.Weight}kg, Attività: {request.Activity}, Obiettivo: {request.Goal}";

            var requestBody = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
                    new { role = "system", content = "Sei un nutrizionista esperto. Calcola TDEE e macronutrienti basati su questi dati. Obiettivi: Dimagrimento (-500 kcal), Mantenimento, Massa (+500 kcal). RESTITUISCI SOLO E SOLTANTO RAW JSON. NESSUNA SPIEGAZIONE. NESSUN MARKDOWN. Formato: { \"Calories\": numero, \"Proteins\": numero, \"Carbs\": numero, \"Fats\": numero }." },
                    new { role = "user", content = prompt }
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

            string cleanJson = (messageContent ?? "{}").Replace("```json", "").Replace("```", "").Trim();
            var macros = JsonSerializer.Deserialize<MacrosResponse>(cleanJson);

            return Ok(macros);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private class MacrosResponse
    {
        public double Calories { get; set; }
        public double Proteins { get; set; }
        public double Carbs { get; set; }
        public double Fats { get; set; }
    }
}

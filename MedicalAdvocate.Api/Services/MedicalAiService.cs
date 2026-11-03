using System.Net;
using System.Text;
using System.Text.Json;

namespace MedicalAdvocate.Api.Services
{
    public class MedicalAiService : IMedicalAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string[] _models;

        public MedicalAiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["AiSettings:ApiKey"] ?? string.Empty;

            // Modelul principal + unul de rezervă, ambele schimbabile din appsettings.json
            var primary = configuration["AiSettings:Model"] ?? "gemini-3.8-flash";
            var fallback = configuration["AiSettings:FallbackModel"] ?? "gemini-2.5-flash";
            _models = new[] { primary, fallback };
        }

        public async Task<string> TranslateMedicalJargonAsync(string anonymizedText)
        {
            var prompt = $"Ești un asistent medical empatic. Explică următorul raport medical pe înțelesul unui pacient fără pregătire medicală. Fii clar și folosește un limbaj accesibil:\n\n{anonymizedText}";

            var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            var json = JsonSerializer.Serialize(requestBody);

            string lastError = string.Empty;

            foreach (var model in _models)
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    using var request = new HttpRequestMessage(HttpMethod.Post, url)
                    {
                        Content = new StringContent(json, Encoding.UTF8, "application/json")
                    };
                    request.Headers.Add("x-goog-api-key", _apiKey);

                    using var response = await _httpClient.SendAsync(request);
                    var responseString = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        using var jsonDocument = JsonDocument.Parse(responseString);

                        var translatedText = jsonDocument.RootElement
                            .GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString();

                        return translatedText ?? "Nu am putut genera o explicație.";
                    }

                    lastError = $"Eroare de la API-ul Google ({response.StatusCode}) pe modelul {model}: {responseString}";

                    // Reîncercăm doar pentru erori temporare (503 / 429)
                    bool temporary = response.StatusCode == HttpStatusCode.ServiceUnavailable
                                  || response.StatusCode == HttpStatusCode.TooManyRequests;

                    if (!temporary)
                        return lastError; // eroare permanentă (cheie greșită, model inexistent etc.)

                    if (attempt < 3)
                        await Task.Delay(1000 * attempt); // 1s, 2s
                }
                // dacă toate încercările au picat, trecem la modelul următor
            }

            return "Serviciul AI este momentan supraîncărcat. Te rog încearcă din nou peste câteva minute.\n\n" + lastError;
        }
    }
}
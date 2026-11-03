using Microsoft.AspNetCore.Mvc;
using MedicalAdvocate.Api.Services;
using MedicalAdvocate.Api.Models;

namespace MedicalAdvocate.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class MedicalReportsController : ControllerBase
    {
        private readonly IPiiAnonymizerService _piiService;
        private readonly IMedicalAiService _aiService;

        // Am adăugat serviciul AI în constructor
        public MedicalReportsController(IPiiAnonymizerService piiService, IMedicalAiService aiService)
        {
            _piiService = piiService;
            _aiService = aiService;
        }

        [HttpPost("analyze")]
        // Funcția a devenit "async Task" pentru că așteptarea răspunsului AI durează
        public async Task<IActionResult> AnalyzeText([FromBody] AnalyzeReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RawText))
            {
                return BadRequest("Textul nu poate fi gol.");
            }

            // 1. Ascundem datele personale (procesare instantanee)
            var cleanText = _piiService.AnonymizeText(request.RawText);

            // 2. Trimitem textul curat către Google Gemini (durează câteva secunde)
            var aiExplanation = await _aiService.TranslateMedicalJargonAsync(cleanText);

            // 3. Returnăm ambele rezultate utilizatorului
            return Ok(new 
            { 
                TextCuratat = cleanText,
                ExplicatiePacient = aiExplanation
            });
        }
    }
}
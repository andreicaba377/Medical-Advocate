using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MedicalAdvocate.Api.Services;
using MedicalAdvocate.Api.Models;
using System.Threading.Tasks;

namespace MedicalAdvocate.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class MedicalReportsController : ControllerBase
    {
        private readonly IPiiAnonymizerService _piiService;
        private readonly IMedicalAiService _aiService;

        // Constructorul care primește serviciile
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

        [HttpPost("upload-pdf")]
        public async Task<IActionResult> UploadPdf(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Fișier invalid sau gol.");
            }

            if (file.ContentType != "application/pdf")
            {
                return BadRequest("Te rugăm să încarci doar fișiere PDF.");
            }

            string extractedText = "";

            try
            {
                // 1. Deschidem și citim PDF-ul folosind pachetul PdfPig
                using (var stream = file.OpenReadStream())
                using (var document = UglyToad.PdfPig.PdfDocument.Open(stream))
                {
                    foreach (var page in document.GetPages())
                    {
                        extractedText += page.Text + " ";
                    }
                }

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest("Nu am putut extrage text din acest PDF (poate conține doar o imagine scanată).");
                }

                // 2. Trecem textul extras prin același proces de Securizare + AI
                var cleanText = _piiService.AnonymizeText(extractedText);
                var aiExplanation = await _aiService.TranslateMedicalJargonAsync(cleanText);

                // 3. Returnăm rezultatele către interfața grafică
                return Ok(new 
                { 
                    textExtras = extractedText,
                    textCuratat = cleanText, 
                    explicatiePacient = aiExplanation 
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Eroare la procesarea PDF-ului: {ex.Message}");
            }
        }
    }
}
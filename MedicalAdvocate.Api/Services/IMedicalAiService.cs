namespace MedicalAdvocate.Api.Services
{
    public interface IMedicalAiService
    {
        Task<string> TranslateMedicalJargonAsync(string anonymizedText);
    }
}
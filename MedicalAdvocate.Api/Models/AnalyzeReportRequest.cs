namespace MedicalAdvocate.Api.Models /// creeaza o categorie organizatorica, acest fisier face parte din sectiunea Models
{
    public class AnalyzeReportRequest /// creeaza o cutie care contine textul brut primit de la utilizator
    {
        public string RawText { get; set; } = string.Empty; /// defineste un camp pentru textul raportului
        /// permite aplicatiei sa citeasca ce scrie in ea si sa si modifice continutul
    }
}
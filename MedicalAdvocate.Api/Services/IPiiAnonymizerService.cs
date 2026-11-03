namespace MedicalAdvocate.Api.Services /// stabileste adresa fisierului in interiorul aplicatiei
{
    public interface IPiiAnonymizerService /// creeaza o interfata(un contract)
    {
        string AnonymizeText(string rawText); /// defineste regula contractului
    }
}
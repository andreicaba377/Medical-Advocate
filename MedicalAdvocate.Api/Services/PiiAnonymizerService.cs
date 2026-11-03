using System.Text.RegularExpressions; /// importa libraria necesara pentru a folosi expresii regulate

namespace MedicalAdvocate.Api.Services /// stabileste adresa fisierului in interiorul aplicatiei
{
    /// creeaza clasa PiiAnonymizerService si forteaza sa respecte regulile din contractul IPiiAnonymizerService
    public class PiiAnonymizerService : IPiiAnonymizerService 
    {
        public string AnonymizeText(string rawText) /// impl. functia care primeste un text initial si returneaza tot un text
        {
            if (string.IsNullOrWhiteSpace(rawText)) return rawText;

            // Ascundem CNP-ul (13 cifre consecutive care încep cu 1-9)
            var result = Regex.Replace(rawText, @"\b[1-9]\d{12}\b", "[CNP_ASCUNS]");

            // Ascundem numerele de telefon (formate românești comune)
            result = Regex.Replace(result, @"(\+40|0)7\d{8}", "[TELEFON_ASCUNS]");

            // Ascundem email-urile
            result = Regex.Replace(result, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[EMAIL_ASCUNS]");

            return result;
        }
    }
}
# Medical Advocate 🩺

A full-stack web application designed to help patients safely understand their medical reports. 

This system automatically detects and redacts Personally Identifiable Information (PII) from raw medical texts to ensure data privacy. Once secured, it leverages the Google Gemini AI API to translate complex medical jargon and diagnoses into easy-to-understand, patient-friendly explanations.

## ✨ Key Features

* 🔒 **Data Privacy (PII Anonymization):** Automatically identifies and hides sensitive information such as Names, CNP (National ID numbers), phone numbers, and emails using a custom C# redaction service. Data is sanitized *before* reaching the AI.
* 🤖 **AI-Powered Translation:** Integrates with the Google Gemini API to explain complex diagnoses, lab results, and recommended treatments in plain, accessible language.
* ⚡ **Modern & Fast UI:** A clean, responsive, and intuitive user interface built with React and styled with Tailwind CSS.
* 🛡️ **Robust Backend:** Secure and scalable RESTful API built with .NET C#.

## 💻 Tech Stack

**Frontend:**
* React
* TypeScript
* Vite
* Tailwind CSS

**Backend:**
* C# .NET Web API
* Google Gemini AI API integration
* Swagger/OpenAPI (for API documentation)

## 🚀 How to Run Locally

### Prerequisites
* Node.js & npm installed
* .NET SDK installed
* A Google Gemini API Key

### Backend Setup (.NET)
1. Navigate to the backend directory: `cd MedicalAdvocate.Api`
2. Create an `appsettings.Development.json` file and add your Google Gemini API key.
3. Run the server:
   ```bash
   dotnet run

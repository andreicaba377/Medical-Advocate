import { useState, useRef } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ textCuratat: string; explicatiePacient: string } | null>(null);
  const [error, setError] = useState('');
  
  // Referință pentru input-ul ascuns de tip file
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async (textToProcess: string = inputText) => {
    if (!textToProcess.trim()) {
      setError('Te rog introdu un text medical.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5295/api/reports/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText: textToProcess })
      });

      if (!response.ok) throw new Error('Eroare de la server.');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setIsLoading(false);
    }
  };

  // NOU: Funcția care procesează PDF-ul
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5295/api/reports/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Eroare la procesarea fișierului PDF.');
      }

      const data = await response.json();
      
      // Punem textul extras în casetă ca să îl vadă utilizatorul
      setInputText(data.textExtras);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea fișierului.');
    } finally {
      setIsLoading(false);
      // Resetăm input-ul de file pentru a putea încărca același fișier din nou dacă e nevoie
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Medical Advocate</h1>
        <p className="text-slate-500 mb-8">
          Sistem inteligent pentru anonimizarea și explicarea analizelor medicale.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Introdu raportul medical:
          </label>
          <textarea
            className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            placeholder="Ex: Pacientul Popescu Ion, CNP 1850101123456... Diagnostic: Steatoză hepatică..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* NOU: Butonul de încărcare PDF */}
        <div className="mb-6 flex justify-end">
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="text-sm font-semibold text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            📎 Încarcă raport PDF
          </button>
        </div>

        {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

        <button 
          onClick={() => handleAnalyze()}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isLoading ? 'Se procesează...' : 'Procesează și Explică'}
        </button>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-800 mb-2">Text Securizat (Fără Date Personale):</h3>
              <p className="text-green-700">{result.textCuratat}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Explicație pentru Pacient (AI):</h3>
              <p className="text-blue-700 whitespace-pre-wrap">{result.explicatiePacient}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
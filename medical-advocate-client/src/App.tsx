import { useState } from 'react';

type AnalyzeResult = {
  textCuratat: string;
  explicatiePacient: string;
};

const EXEMPLU =
  'Pacientul Munteanu Vasile, CNP 1780512123456, număr de telefon 0722123456. În urma investigațiilor s-a stabilit diagnosticul de steatoză hepatică gradul II și litiază biliară. Analizele arată TGO 55 U/L și TGP 72 U/L. Se recomandă colecistectomie laparoscopică programată și un regim alimentar hipolipidic strict.';

const MAX_CHARS = 5000;

function ShieldIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SparkIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponibil */
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
    >
      {copied ? 'Copiat ✓' : 'Copiază'}
    </button>
  );
}

function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Te rog introdu un text medical.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch('http://localhost:5295/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Eroare de la server.');
      }

      const data: AnalyzeResult = await response.json();
      setResult(data);
    } catch {
      setError(
        'Nu am putut procesa raportul. Verifică dacă serverul backend rulează și încearcă din nou.'
      );
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Medical Advocate</h1>
              <p className="text-xs text-slate-500">Anonimizare și explicare a rapoartelor medicale</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Datele personale sunt eliminate înainte de analiză
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Înțelege-ți raportul medical, în siguranță
          </h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Lipește textul raportului. Datele tale personale (CNP, telefon) sunt ascunse automat, iar
            conținutul medical este explicat pe înțelesul tuturor.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Coloana stânga: input */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="raport" className="text-sm font-semibold text-slate-800">
                Raport medical
              </label>
              <button
                onClick={() => setInputText(EXEMPLU)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Încarcă un exemplu
              </button>
            </div>

            <textarea
              id="raport"
              className="w-full h-72 p-4 text-sm leading-relaxed border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none resize-none transition"
              placeholder="Lipește aici textul raportului medical..."
              value={inputText}
              maxLength={MAX_CHARS}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>
                {inputText.length} / {MAX_CHARS} caractere
              </span>
              {inputText && (
                <button onClick={handleReset} className="hover:text-slate-600 transition-colors">
                  Șterge tot
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <span aria-hidden>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputText.trim()}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:brightness-100"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Se analizează raportul...
                </>
              ) : (
                <>
                  <SparkIcon />
                  Anonimizează și explică
                </>
              )}
            </button>
          </section>

          {/* Coloana dreapta: rezultate */}
          <section className="space-y-6">
            {!result && !isLoading && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <SparkIcon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-700">Rezultatele apar aici</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Vei primi textul anonimizat și o explicație clară a diagnosticului.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse space-y-4">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
                <div className="h-3 bg-slate-200 rounded w-4/6" />
                <div className="h-4 w-1/3 bg-slate-200 rounded mt-6" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            )}

            {result && (
              <>
                <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-teal-50 border-b border-teal-100">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-teal-800">
                      <ShieldIcon className="w-4 h-4" />
                      Text securizat (fără date personale)
                    </h3>
                    <CopyButton text={result.textCuratat} />
                  </div>
                  <p className="px-6 py-5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {result.textCuratat}
                  </p>
                </article>

                <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                      <SparkIcon className="w-4 h-4" />
                      Explicație pentru pacient
                    </h3>
                    <CopyButton text={result.explicatiePacient} />
                  </div>
                  <p className="px-6 py-5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {result.explicatiePacient}
                  </p>
                </article>
              </>
            )}
          </section>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-slate-500 text-center max-w-3xl mx-auto leading-relaxed">
          Această aplicație oferă doar explicații cu caracter informativ și nu înlocuiește consultul
          medical. Pentru diagnostic și tratament, discută întotdeauna cu medicul tău.
        </p>
      </main>
    </div>
  );
}

export default App;
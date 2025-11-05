import React, { useState, useEffect, useCallback } from 'react';
import { AIGeminiIcon, CodeIcon, SpinnerIcon } from '../components/Icons';
import { getCodeExplanation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { SingleDueDateView } from './SingleDueDateView';
import { DoubleDueDateView } from './DoubleDueDateView';

enum View {
  SingleDate = 'Vencimiento Único',
  DoubleDate = 'Doble Vencimiento',
}

export const CodeAnalysisView: React.FC = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(View.SingleDate);

  const fetchExplanation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCodeExplanation();
      setExplanation(result);
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Ocurrió un error desconocido.';
      setError(`Falló la obtención de la explicación de la IA. (${errorMessage})`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  const renderContent = () => {
    switch (activeView) {
      case View.SingleDate:
        return <SingleDueDateView />;
      case View.DoubleDate:
        return <DoubleDueDateView />;
      default:
        return null;
    }
  };

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Análisis del Código Fuente</h1>
      <p className="text-lg text-gray-600 mb-8">Un desglose impulsado por IA de un complejo script de Python para liquidación de impuestos.</p>

      <section id="ai-explanation" className="mb-12">
         <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-2 rounded-full border border-gray-200">
                  <AIGeminiIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Resumen Generado por IA</h2>
          </div>
          {isLoading && (
            <div className="flex items-center justify-center gap-3 text-gray-600 py-10">
              <SpinnerIcon className="w-6 h-6 animate-spin" />
              <span>Analizando el código con Gemini...</span>
            </div>
          )}
          {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}
          {explanation && !isLoading && (
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{explanation}</ReactMarkdown>
            </div>
          )}
        </div>
      </section>

      <section id="code-breakdown">
         <div className="flex items-center gap-3 mb-4">
              <CodeIcon className="w-8 h-8 text-gray-500" />
              <h2 className="text-2xl font-bold text-gray-800">Desglose Detallado del Código</h2>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
              {Object.values(View).map((view) => (
                  <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`px-4 py-3 -mb-px text-base font-semibold focus:outline-none transition-colors duration-200 ${
                          activeView === view
                              ? 'border-b-2 border-indigo-600 text-indigo-600'
                              : 'text-gray-500 hover:text-indigo-500'
                      }`}
                  >
                      {view}
                  </button>
              ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-8">
              {renderContent()}
          </div>
      </section>
    </>
  );
};
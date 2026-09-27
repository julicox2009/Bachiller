import { useState } from 'react';
import { supabase } from '../services/supabase';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Diagnostic() {
  const { darkMode } = useStore();
  const [results, setResults] = useState<Array<{ test: string; status: 'success' | 'error' | 'loading'; message: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Conexión básica
    setResults(prev => [...prev, { test: 'Conexión a Supabase', status: 'loading', message: 'Verificando...' }]);
    try {
      const { error } = await supabase.from('subjects').select('count').limit(1);
      if (error) {
        setResults(prev => prev.map(r => r.test === 'Conexión a Supabase' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === 'Conexión a Supabase' 
          ? { ...r, status: 'success', message: 'Conexión exitosa' }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === 'Conexión a Supabase' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    // Test 2: Insertar dato de prueba
    setResults(prev => [...prev, { test: 'Insertar dato de prueba', status: 'loading', message: 'Insertando...' }]);
    const testId = 'test-' + Date.now();
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          id: testId,
          name: 'Prueba Diagnóstico',
          color: '#FF0000',
          professor: 'Test'
        }])
        .select()
        .single();

      if (error) {
        setResults(prev => prev.map(r => r.test === 'Insertar dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}\n\nSOLUCIÓN: Ejecuta el script SQL de políticas RLS en Supabase` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === 'Insertar dato de prueba' 
          ? { ...r, status: 'success', message: `Dato insertado con ID: ${data.id}` }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === 'Insertar dato de prueba' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    // Test 3: Leer dato de prueba
    setResults(prev => [...prev, { test: 'Leer dato de prueba', status: 'loading', message: 'Leyendo...' }]);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) {
        setResults(prev => prev.map(r => r.test === 'Leer dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
      } else if (data) {
        setResults(prev => prev.map(r => r.test === 'Leer dato de prueba' 
          ? { ...r, status: 'success', message: `Dato leído: ${data.name}` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === 'Leer dato de prueba' 
          ? { ...r, status: 'error', message: 'No se encontró el dato insertado' }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === 'Leer dato de prueba' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    // Test 4: Eliminar dato de prueba
    setResults(prev => [...prev, { test: 'Eliminar dato de prueba', status: 'loading', message: 'Eliminando...' }]);
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', testId);

      if (error) {
        setResults(prev => prev.map(r => r.test === 'Eliminar dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === 'Eliminar dato de prueba' 
          ? { ...r, status: 'success', message: 'Dato eliminado correctamente' }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === 'Eliminar dato de prueba' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    setIsRunning(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold">Diagnóstico de Supabase</h2>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Verifica la conexión y permisos de Supabase
        </p>
      </div>

      <div className={`${cardClass} border rounded-2xl p-6`}>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Ejecutando diagnóstico...
            </>
          ) : (
            'Ejecutar Diagnóstico'
          )}
        </button>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-500/10 border-green-500'
                    : result.status === 'error'
                    ? 'bg-red-500/10 border-red-500'
                    : 'bg-blue-500/10 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === 'success' && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />}
                  {result.status === 'error' && <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
                  {result.status === 'loading' && <Loader2 size={20} className="text-blue-500 animate-spin flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{result.test}</p>
                    <p className={`text-sm mt-1 whitespace-pre-wrap ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {results.some(r => r.status === 'error') && (
        <div className={`${cardClass} border rounded-2xl p-6 border-l-4 border-orange-500`}>
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Solución</h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Si ves errores de "row-level security" o "permission denied", necesitas configurar las políticas RLS en Supabase:
              </p>
              <ol className={`text-sm space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>1. Ve a Supabase → SQL Editor</li>
                <li>2. Ejecuta el script de políticas RLS (ver abajo)</li>
                <li>3. Vuelve a ejecutar el diagnóstico</li>
              </ol>
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-xs font-mono whitespace-pre-wrap">
{`-- Script de políticas RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON class_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exam_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON assignment_steps FOR ALL USING (true) WITH CHECK (true);`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.every(r => r.status === 'success') && (
        <div className={`${cardClass} border rounded-2xl p-6 border-l-4 border-green-500`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">¡Todo funciona correctamente!</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                La conexión con Supabase está configurada correctamente. Los datos se sincronizarán automáticamente entre dispositivos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../services/supabase';
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

    // Mostrar configuración
    setResults([{
      test: '🔧 Configuración',
      status: 'success',
      message: `URL: ${supabaseUrl}\nKey: ${supabaseAnonKey.substring(0, 30)}...`
    }]);

    // Test 1: Conexión básica
    setResults(prev => [...prev, { test: '🔌 Conexión a Supabase', status: 'loading', message: 'Verificando...' }]);
    try {
      const { error } = await supabase.from('subjects').select('count').limit(1);
      if (error) {
        setResults(prev => prev.map(r => r.test === '🔌 Conexión a Supabase' 
          ? { ...r, status: 'error', message: `Error: ${error.message}\n\n🔴 PROBLEMA: Las políticas RLS no están configuradas\n\n✅ SOLUCIÓN: Ejecuta el script "configuracion_completa.sql" en Supabase SQL Editor` }
          : r
        ));
        setIsRunning(false);
        return;
      } else {
        setResults(prev => prev.map(r => r.test === '🔌 Conexión a Supabase' 
          ? { ...r, status: 'success', message: '✅ Conexión exitosa' }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === '🔌 Conexión a Supabase' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
      setIsRunning(false);
      return;
    }

    // Test 2: Insertar dato de prueba
    setResults(prev => [...prev, { test: '➕ Insertar dato de prueba', status: 'loading', message: 'Insertando...' }]);
    
    const testId = crypto.randomUUID();
    
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
        setResults(prev => prev.map(r => r.test === '➕ Insertar dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}\n\n🔴 PROBLEMA: No tienes permisos de INSERT\n\n✅ SOLUCIÓN: Ejecuta el script "configuracion_completa.sql" en Supabase SQL Editor` }
          : r
        ));
        setIsRunning(false);
        return;
      } else {
        setResults(prev => prev.map(r => r.test === '➕ Insertar dato de prueba' 
          ? { ...r, status: 'success', message: `✅ Dato insertado con ID: ${data.id}` }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === '➕ Insertar dato de prueba' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
      setIsRunning(false);
      return;
    }

    // Test 3: Leer dato de prueba
    setResults(prev => [...prev, { test: '📖 Leer dato de prueba', status: 'loading', message: 'Leyendo...' }]);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) {
        setResults(prev => prev.map(r => r.test === '📖 Leer dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
        setIsRunning(false);
        return;
      } else if (data) {
        setResults(prev => prev.map(r => r.test === '📖 Leer dato de prueba' 
          ? { ...r, status: 'success', message: `✅ Dato leído: ${data.name}` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === '📖 Leer dato de prueba' 
          ? { ...r, status: 'error', message: 'No se encontró el dato insertado' }
          : r
        ));
        setIsRunning(false);
        return;
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === '📖 Leer dato de prueba' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
      setIsRunning(false);
      return;
    }

    // Test 4: Eliminar dato de prueba
    setResults(prev => [...prev, { test: '🗑️ Eliminar dato de prueba', status: 'loading', message: 'Eliminando...' }]);
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', testId);

      if (error) {
        setResults(prev => prev.map(r => r.test === '🗑️ Eliminar dato de prueba' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
      } else {
        setResults(prev => prev.map(r => r.test === '🗑️ Eliminar dato de prueba' 
          ? { ...r, status: 'success', message: '✅ Dato eliminado correctamente' }
          : r
        ));
      }
    } catch (e: any) {
      setResults(prev => prev.map(r => r.test === '🗑️ Eliminar dato de prueba' 
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
            '🚀 Ejecutar Diagnóstico'
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
              <h3 className="font-bold text-lg mb-2">🔧 Solución</h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Los errores indican que las políticas RLS no están configuradas. Sigue estos pasos:
              </p>
              <ol className={`text-sm space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><strong>1.</strong> Ve a Supabase → SQL Editor</li>
                <li><strong>2.</strong> Copia y pega el script <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">configuracion_completa.sql</code></li>
                <li><strong>3.</strong> Ejecuta el script (botón "Run")</li>
                <li><strong>4.</strong> Vuelve aquí y ejecuta el diagnóstico nuevamente</li>
              </ol>
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-xs font-mono whitespace-pre-wrap">
{`-- Script de configuración completa
-- Ejecutar en Supabase SQL Editor

-- Crear tablas
CREATE TABLE IF NOT EXISTS subjects (...);
CREATE TABLE IF NOT EXISTS class_sessions (...);
CREATE TABLE IF NOT EXISTS exams (...);
CREATE TABLE IF NOT EXISTS exam_topics (...);
CREATE TABLE IF NOT EXISTS assignments (...);
CREATE TABLE IF NOT EXISTS assignment_steps (...);

-- Habilitar RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
-- ... (resto del script)

-- Crear políticas
CREATE POLICY "allow_all_subjects" ON subjects
  FOR ALL USING (true) WITH CHECK (true);
-- ... (resto de políticas)`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.every(r => r.status === 'success') && results.length > 1 && (
        <div className={`${cardClass} border rounded-2xl p-6 border-l-4 border-green-500`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">✅ ¡Todo funciona correctamente!</h3>
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

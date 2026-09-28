import { useRef, useState } from 'react';
import { Download, Upload, Moon, Sun, Bell, Database, Info, CheckCircle, Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase, supabaseUrl, supabaseAnonKey, testConnection } from '../services/supabase';

export default function Settings() {
  const { darkMode, toggleDarkMode, exportData, importData, subjects, classes, exams, assignments } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [diagnosticResults, setDiagnosticResults] = useState<Array<{ test: string; status: 'success' | 'error' | 'loading'; message: string }>>([]);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticResults([]);

    // Test 1: Conexión directa
    setDiagnosticResults(prev => [...prev, { test: '🔌 Conexión a Supabase', status: 'loading', message: 'Verificando...' }]);
    try {
      await testConnection();
      setDiagnosticResults(prev => prev.map(r => r.test === '🔌 Conexión a Supabase' 
        ? { ...r, status: 'success', message: '✅ Conexión exitosa con Supabase' }
        : r
      ));
    } catch (e: any) {
      setDiagnosticResults(prev => prev.map(r => r.test === '🔌 Conexión a Supabase' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    // Test 2: Cliente Supabase
    setDiagnosticResults(prev => [...prev, { test: '🔌 Cliente Supabase', status: 'loading', message: 'Verificando...' }]);
    try {
      const { data, error } = await supabase.from('subjects').select('*').limit(1);
      if (error) {
        setDiagnosticResults(prev => prev.map(r => r.test === '🔌 Cliente Supabase' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` }
          : r
        ));
      } else {
        setDiagnosticResults(prev => prev.map(r => r.test === '🔌 Cliente Supabase' 
          ? { ...r, status: 'success', message: `✅ Cliente funcionando. Registros: ${data?.length || 0}` }
          : r
        ));
      }
    } catch (e: any) {
      setDiagnosticResults(prev => prev.map(r => r.test === '🔌 Cliente Supabase' 
        ? { ...r, status: 'error', message: `Error: ${e.message}` }
        : r
      ));
    }

    setIsRunningDiagnostic(false);
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bachiller-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Mostrar feedback visual
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const json = event.target?.result as string;
      const success = await importData(json);
      if (success) {
        alert('✅ Datos importados correctamente');
      } else {
        alert('❌ Error al importar. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationStatus('granted');
        new Notification('BachillerManager', {
          body: '¡Notificaciones activadas! Te avisaremos antes de tus clases y exámenes.',
        });
      } else {
        setNotificationStatus('denied');
      }
    } else {
      alert('Tu navegador no soporta notificaciones');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold">Ajustes</h2>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Personaliza tu experiencia
        </p>
      </div>

      {/* Appearance */}
      <div className={`${cardClass} border rounded-2xl p-6`}>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          {darkMode ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-500" />}
          Apariencia
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Modo {darkMode ? 'Oscuro' : 'Claro'}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Cambia entre tema claro y oscuro
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className={`${cardClass} border rounded-2xl p-6`}>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Bell size={20} className="text-green-500" />
          Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recordatorios locales</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Recibe avisos antes de clases y exámenes
              </p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                notificationStatus === 'granted'
                  ? 'bg-green-600 text-white'
                  : notificationStatus === 'denied'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {notificationStatus === 'granted' ? (
                <>
                  <CheckCircle size={16} />
                  Activadas
                </>
              ) : notificationStatus === 'denied' ? (
                'Denegadas'
              ) : (
                'Activar'
              )}
            </button>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>Configuración de recordatorios:</strong>
            </p>
            <ul className={`text-sm mt-2 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>• 15 minutos antes de cada clase</li>
              <li>• 24 horas antes de exámenes</li>
              <li>• 48 horas antes de exámenes urgentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={`${cardClass} border rounded-2xl p-6`}>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Database size={20} className="text-purple-500" />
          Gestión de Datos
        </h3>
        <div className="space-y-4">
          {/* Stats */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-2">Resumen de datos almacenados:</p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">{subjects.length}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Asignaturas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{classes.length}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clases</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{exams.length}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exámenes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{assignments.length}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Trabajos</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar datos</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Descarga una copia de seguridad en JSON
              </p>
            </div>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                exportSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle size={16} />
                  ¡Exportado!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Exportar
                </>
              )}
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Importar datos</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Restaura desde un archivo de respaldo
              </p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium cursor-pointer">
              <Upload size={16} />
              Importar
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className={`${cardClass} border rounded-2xl p-6`}>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Activity size={20} className="text-blue-500" />
          Diagnóstico de Supabase
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verificar conexión</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Comprueba la sincronización con Supabase
              </p>
            </div>
            <button
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningDiagnostic ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Activity size={16} />
                  Ejecutar
                </>
              )}
            </button>
          </div>

          {diagnosticResults.length > 0 && (
            <div className="space-y-2 mt-4">
              {diagnosticResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border-l-4 ${
                    result.status === 'success'
                      ? 'bg-green-500/10 border-green-500'
                      : result.status === 'error'
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-blue-500/10 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.status === 'success' && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />}
                    {result.status === 'error' && <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    {result.status === 'loading' && <Loader2 size={16} className="text-blue-500 animate-spin flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{result.test}</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={`${cardClass} border rounded-2xl p-6`}>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Info size={20} className="text-gray-400" />
          Acerca de
        </h3>
        <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p><strong>BachillerManager</strong> v1.0.0</p>
          <p className="italic">Asistente de gestión académica de Jesús</p>
          <p>Aplicación de gestión académica 100% offline.</p>
          <p>Todos los datos se almacenan localmente en tu dispositivo.</p>
          <p className="mt-4">
            <strong>Plataformas soportadas:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Android (Chrome / PWA instalable)</li>
            <li>Windows / macOS / Linux (Navegador o PWA)</li>
            <li>iOS (Safari / PWA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function FocusMode() {
  const { pomodoroMinutes, setPomodoroMinutes, currentFocusTask, setCurrentFocusTask, assignments, subjects, darkMode } = useStore();
  const [timeLeft, setTimeLeft] = useState(pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (!isBreak) {
        // Fin de sesión de trabajo, iniciar descanso
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minutos de descanso
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 ¡Buen trabajo!', {
            body: 'Tómate un descanso de 5 minutos',
          });
        }
      } else {
        // Fin del descanso, volver a trabajo
        setIsBreak(false);
        setTimeLeft(pomodoroMinutes * 60);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('☕ ¡Descanso terminado!', {
            body: '¿Listo para otra sesión de enfoque?',
          });
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isBreak, pomodoroMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(pomodoroMinutes * 60);
  };

  const pendingAssignments = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className={`${cardClass} border rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isBreak ? 'bg-green-500/10' : 'bg-purple-500/10'}`}>
          {isBreak ? (
            <Coffee size={24} className="text-green-500" />
          ) : (
            <Brain size={24} className="text-purple-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold">Modo Enfoque</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isBreak ? 'Descanso' : 'Técnica Pomodoro'}
          </p>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold mb-4 ${isBreak ? 'text-green-500' : 'text-purple-500'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <Pause size={18} />
                Pausar
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play size={18} />
                Iniciar
              </span>
            )}
          </button>
          <button
            onClick={handleReset}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Configuración de tiempo */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Duración de sesión (minutos)</label>
        <div className="flex gap-2">
          {[15, 25, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setPomodoroMinutes(mins);
                if (!isRunning) {
                  setTimeLeft(mins * 60);
                }
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                pomodoroMinutes === mins
                  ? 'bg-purple-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mins}
            </button>
          ))}
        </div>
      </div>

      {/* Tarea actual */}
      {currentFocusTask && (
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className="text-sm font-medium mb-1">Enfocándote en:</p>
          <p className="font-bold">{assignments.find(a => a.id === currentFocusTask)?.title}</p>
          <button
            onClick={() => setCurrentFocusTask(null)}
            className="text-xs text-purple-500 hover:underline mt-2"
          >
            Cambiar tarea
          </button>
        </div>
      )}

      {/* Tareas pendientes */}
      {!currentFocusTask && pendingAssignments.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">¿En qué te enfocas?</p>
          <div className="space-y-2">
            {pendingAssignments.map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => setCurrentFocusTask(assignment.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-sm">{assignment.title}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subjects.find(s => s.id === assignment.subjectId)?.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

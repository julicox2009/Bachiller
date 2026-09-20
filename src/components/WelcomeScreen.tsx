import { BookOpen, GraduationCap } from 'lucide-react';
import { useStore } from '../store/useStore';

interface WelcomeScreenProps {
  onNavigate: (page: string) => void;
}

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const { darkMode } = useStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25 rotate-3 hover:rotate-0 transition-transform">
          <GraduationCap size={48} className="text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg animate-bounce">
          ✨
        </div>
      </div>

      <h2 className="text-3xl lg:text-4xl font-bold mb-3">
        ¡Bienvenido a{' '}
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          AcademicManager
        </span>
        !
      </h2>
      <p className={`text-lg max-w-md mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Tu asistente de gestión académica. Comienza agregando tus asignaturas para organizar tu horario y exámenes.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5 text-center`}>
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} className="text-green-500" />
          </div>
          <p className="font-bold mb-1">1. Asignaturas</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Agrega tus materias con colores personalizados
          </p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5 text-center`}>
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <p className="font-bold mb-1">2. Horario</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Organiza tus clases semanales
          </p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5 text-center`}>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📝</span>
          </div>
          <p className="font-bold mb-1">3. Exámenes</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Programa exámenes y lleva tu estudio
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate('subjects')}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40"
      >
        Comenzar →
      </button>
    </div>
  );
}

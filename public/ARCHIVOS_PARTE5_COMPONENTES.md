# 📦 PARTE 5: Componentes y Páginas (Archivos 10-16)

---

## 📄 ARCHIVO 10: `src/components/Layout.tsx`

```tsx
import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Clock, Settings, Menu, X, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Horario', icon: Clock },
  { id: 'exams', label: 'Exámenes', icon: Calendar },
  { id: 'subjects', label: 'Asignaturas', icon: BookOpen },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          BachillerManager
        </h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r z-40`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen size={24} className="text-blue-500" />
              BachillerManager
            </h1>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Asistente académico de Jesús
            </p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                currentPage === item.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {darkMode ? '☀️' : '🌙'}
            <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 bottom-0 w-72 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                BachillerManager
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

## 📄 ARCHIVO 11: `src/components/WelcomeScreen.tsx`

```tsx
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
          BachillerManager
        </span>
        !
      </h2>
      <p className={`text-sm italic max-w-md mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Asistente de gestión académica de Jesús
      </p>
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
```

---

**Continúa en PARTE 6 con las páginas...**

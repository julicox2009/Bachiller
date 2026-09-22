import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { initDatabase } from './services/database';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Exams from './pages/Exams';
import Assignments from './pages/Assignments';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dbReady, setDbReady] = useState(false);
  const { darkMode, subjects, loadFromDatabase } = useStore();

  // Inicializar SQLite al cargar la app
  useEffect(() => {
    initDatabase()
      .then(() => {
        loadFromDatabase();
        setDbReady(true);
      })
      .catch((error) => {
        console.error('Error inicializando base de datos:', error);
        setDbReady(true); // Continuar aunque falle
      });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Schedule notifications
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const { classes, exams, subjects: subs } = useStore.getState();
      const now = new Date();
      const todayDay = now.getDay();
      if (todayDay === 0 || todayDay === 6) return;
      const dayOfWeek = todayDay - 1;

      // Check class reminders (15 min before)
      classes
        .filter((c) => c.dayOfWeek === dayOfWeek)
        .forEach((cls) => {
          const subject = subs.find((s) => s.id === cls.subjectId);
          if (!subject) return;
          const [hours, minutes] = cls.startTime.split(':').map(Number);
          const classTime = new Date(now);
          classTime.setHours(hours, minutes, 0, 0);
          const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000);
          const diff = reminderTime.getTime() - now.getTime();

          if (diff >= 0 && diff < 60000) {
            new Notification('📚 Clase en 15 minutos', {
              body: `${subject.name} - Aula ${cls.room}`,
            });
          }
        });

      // Check exam reminders (24h and 48h before)
      exams.forEach((exam) => {
        const subject = subs.find((s) => s.id === exam.subjectId);
        if (!subject) return;
        const examDate = new Date(exam.date + 'T' + exam.time);
        const hoursUntil = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (exam.priority === 'urgent' && hoursUntil > 47 && hoursUntil < 49) {
          new Notification('⚠️ Examen urgente en 48h', {
            body: `${subject.name} - ${exam.date} a las ${exam.time}`,
          });
        } else if (hoursUntil > 23 && hoursUntil < 25) {
          new Notification('📝 Examen mañana', {
            body: `${subject.name} - ${exam.date} a las ${exam.time}`,
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mostrar pantalla de carga mientras se inicializa SQLite
  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Inicializando BachillerManager...</p>
          <p className="text-sm opacity-80 mt-2">Cargando base de datos SQLite</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Show welcome screen if no subjects and on dashboard
    if (subjects.length === 0 && currentPage === 'dashboard') {
      return <WelcomeScreen onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'schedule': return <Schedule />;
      case 'exams': return <Exams />;
      case 'assignments': return <Assignments />;
      case 'subjects': return <Subjects />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;

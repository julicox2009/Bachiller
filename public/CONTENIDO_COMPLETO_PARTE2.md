# 📦 CONTENIDO COMPLETO DE ARCHIVOS - BachillerManager (PARTE 2)

---

## 📄 ARCHIVO 7: `src/store/useStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, ClassSession, Exam, ExamTopic } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  darkMode: boolean;

  // Subject actions
  addSubject: (name: string, color: string, professor: string) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Class actions
  addClass: (cls: Omit<ClassSession, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;

  // Exam actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleTopic: (examId: string, topicId: string) => void;
  addTopic: (examId: string, topicName: string) => void;
  deleteTopic: (examId: string, topicId: string) => void;

  // Settings
  toggleDarkMode: () => void;

  // Import/Export
  exportData: () => string;
  importData: (json: string) => boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      subjects: [],
      classes: [],
      exams: [],
      darkMode: false,

      // Subject actions
      addSubject: (name, color, professor) =>
        set((state) => ({
          subjects: [...state.subjects, { id: uuidv4(), name, color, professor }],
        })),

      updateSubject: (id, data) =>
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          classes: state.classes.filter((c) => c.subjectId !== id),
          exams: state.exams.filter((e) => e.subjectId !== id),
        })),

      // Class actions
      addClass: (cls) =>
        set((state) => ({
          classes: [...state.classes, { ...cls, id: uuidv4() }],
        })),

      updateClass: (id, data) =>
        set((state) => ({
          classes: state.classes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
        })),

      // Exam actions
      addExam: (exam) =>
        set((state) => ({
          exams: [...state.exams, { ...exam, id: uuidv4() }],
        })),

      updateExam: (id, data) =>
        set((state) => ({
          exams: state.exams.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteExam: (id) =>
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== id),
        })),

      toggleTopic: (examId, topicId) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  topics: e.topics.map((t) =>
                    t.id === topicId ? { ...t, completed: !t.completed } : t
                  ),
                }
              : e
          ),
        })),

      addTopic: (examId, topicName) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  topics: [...e.topics, { id: uuidv4(), name: topicName, completed: false }],
                }
              : e
          ),
        })),

      deleteTopic: (examId, topicId) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? { ...e, topics: e.topics.filter((t) => t.id !== topicId) }
              : e
          ),
        })),

      // Settings
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Import/Export
      exportData: () => {
        const { subjects, classes, exams } = get();
        return JSON.stringify({ subjects, classes, exams, exportedAt: new Date().toISOString() }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.subjects && data.classes && data.exams) {
            set({ subjects: data.subjects, classes: data.classes, exams: data.exams });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'bachiller-manager-storage',
    }
  )
);
```

---

## 📄 ARCHIVO 8: `src/App.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Exams from './pages/Exams';
import Subjects from './pages/Subjects';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { darkMode, subjects } = useStore();

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

  const renderPage = () => {
    // Show welcome screen if no subjects and on dashboard
    if (subjects.length === 0 && currentPage === 'dashboard') {
      return <WelcomeScreen onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'schedule': return <Schedule />;
      case 'exams': return <Exams />;
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
```

---

Continuará en el siguiente mensaje con los componentes y páginas...

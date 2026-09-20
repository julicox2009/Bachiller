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

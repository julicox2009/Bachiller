import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, ClassSession, Exam, Assignment } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  assignments: Assignment[];
  darkMode: boolean;
  currentFocusTask: string | null;
  pomodoroMinutes: number;
  completedToday: number;
  streak: number;

  // Acciones de Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Acciones de Classes
  addClass: (cls: Omit<ClassSession, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;

  // Acciones de Exams
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleTopic: (examId: string, topicId: string) => void;
  addTopic: (examId: string, topicName: string) => void;
  deleteTopic: (examId: string, topicId: string) => void;

  // Acciones de Assignments
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignment: (id: string) => void;
  toggleAssignmentStep: (assignmentId: string, stepId: string) => void;
  addAssignmentStep: (assignmentId: string, stepName: string) => void;
  deleteAssignmentStep: (assignmentId: string, stepId: string) => void;

  // Acciones de configuración
  toggleDarkMode: () => void;
  setCurrentFocusTask: (taskId: string | null) => void;
  setPomodoroMinutes: (minutes: number) => void;

  // Export/Import
  exportData: () => string;
  importData: (json: string) => boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      subjects: [],
      classes: [],
      exams: [],
      assignments: [],
      darkMode: false,
      currentFocusTask: null,
      pomodoroMinutes: 25,
      completedToday: 0,
      streak: 0,

      // ===== SUBJECTS =====
      addSubject: (subject) =>
        set((state) => ({
          subjects: [...state.subjects, { ...subject, id: uuidv4() }],
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
          assignments: state.assignments.filter((a) => a.subjectId !== id),
        })),

      // ===== CLASSES =====
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

      // ===== EXAMS =====
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

      // ===== ASSIGNMENTS =====
      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [...state.assignments, { ...assignment, id: uuidv4(), completed: false }],
        })),

      updateAssignment: (id, data) =>
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      toggleAssignment: (id) =>
        set((state) => {
          const assignment = state.assignments.find((a) => a.id === id);
          if (!assignment) return state;

          const newCompleted = !assignment.completed;

          if (newCompleted) {
            const completedToday = state.completedToday + 1;
            return {
              completedToday,
              assignments: state.assignments.map((a) =>
                a.id === id ? { ...a, completed: newCompleted } : a
              ),
            };
          }

          return {
            assignments: state.assignments.map((a) =>
              a.id === id ? { ...a, completed: newCompleted } : a
            ),
          };
        }),

      toggleAssignmentStep: (assignmentId, stepId) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  steps: a.steps.map((s) =>
                    s.id === stepId ? { ...s, completed: !s.completed } : s
                  ),
                }
              : a
          ),
        })),

      addAssignmentStep: (assignmentId, stepName) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  steps: [...a.steps, { id: uuidv4(), name: stepName, completed: false }],
                }
              : a
          ),
        })),

      deleteAssignmentStep: (assignmentId, stepId) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? { ...a, steps: a.steps.filter((s) => s.id !== stepId) }
              : a
          ),
        })),

      // ===== CONFIG =====
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setCurrentFocusTask: (taskId) => set({ currentFocusTask: taskId }),
      setPomodoroMinutes: (minutes) => set({ pomodoroMinutes: minutes }),

      // ===== EXPORT/IMPORT =====
      exportData: () => {
        const { subjects, classes, exams, assignments } = get();
        return JSON.stringify(
          { subjects, classes, exams, assignments, exportedAt: new Date().toISOString() },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.subjects && data.classes && data.exams && data.assignments) {
            set({
              subjects: data.subjects,
              classes: data.classes,
              exams: data.exams,
              assignments: data.assignments,
            });
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, ClassSession, Exam, Assignment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  subjectsAPI,
  classSessionsAPI,
  examsAPI,
  examTopicsAPI,
  assignmentsAPI,
  assignmentStepsAPI,
} from '../services/supabase';

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
  isOnline: boolean;

  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  addClass: (cls: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (id: string, data: Partial<ClassSession>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  toggleTopic: (examId: string, topicId: string) => Promise<void>;
  addTopic: (examId: string, topicName: string) => Promise<void>;
  deleteTopic: (examId: string, topicId: string) => Promise<void>;

  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, data: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  toggleAssignment: (id: string) => Promise<void>;
  toggleAssignmentStep: (assignmentId: string, stepId: string) => Promise<void>;
  addAssignmentStep: (assignmentId: string, stepName: string) => Promise<void>;
  deleteAssignmentStep: (assignmentId: string, stepId: string) => Promise<void>;

  toggleDarkMode: () => void;
  setCurrentFocusTask: (taskId: string | null) => void;
  setPomodoroMinutes: (minutes: number) => void;

  exportData: () => string;
  importData: (json: string) => Promise<boolean>;

  loadFromSupabase: () => Promise<void>;
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
      isOnline: true,

      loadFromSupabase: async () => {
        try {
          console.log('🔄 Cargando datos desde Supabase...');

          const { data: subjectsData, error: subjectsError } = await subjectsAPI.getAll();
          if (subjectsError) throw subjectsError;

          const { data: classesData, error: classesError } = await classSessionsAPI.getAll();
          if (classesError) throw classesError;

          const { data: examsData, error: examsError } = await examsAPI.getAll();
          if (examsError) throw examsError;

          const { data: topicsData, error: topicsError } = await examTopicsAPI.getAll();
          if (topicsError) throw topicsError;

          const { data: assignmentsData, error: assignmentsError } = await assignmentsAPI.getAll();
          if (assignmentsError) throw assignmentsError;

          const { data: stepsData, error: stepsError } = await assignmentStepsAPI.getAll();
          if (stepsError) throw stepsError;

          const subjects: Subject[] = subjectsData || [];
          const classes: ClassSession[] = (classesData || []).map((cls: any) => ({
            id: cls.id,
            subjectId: cls.subject_id,
            dayOfWeek: cls.day_of_week,
            startTime: cls.start_time,
            endTime: cls.end_time,
            room: cls.room,
          }));

          const exams: Exam[] = (examsData || []).map((exam: any) => ({
            id: exam.id,
            subjectId: exam.subject_id,
            date: exam.date,
            time: exam.time,
            room: exam.room,
            priority: exam.priority,
            notes: exam.notes,
            topics: (topicsData || [])
              .filter((t: any) => t.exam_id === exam.id)
              .map((t: any) => ({
                id: t.id,
                name: t.name,
                completed: t.completed,
              })),
          }));

          const assignments: Assignment[] = (assignmentsData || []).map((assignment: any) => ({
            id: assignment.id,
            subjectId: assignment.subject_id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.due_date,
            dueTime: assignment.due_time,
            type: assignment.type,
            priority: assignment.priority,
            completed: assignment.completed,
            notes: assignment.notes,
            steps: (stepsData || [])
              .filter((s: any) => s.assignment_id === assignment.id)
              .map((s: any) => ({
                id: s.id,
                name: s.name,
                completed: s.completed,
              })),
          }));

          set({
            subjects,
            classes,
            exams,
            assignments,
            isOnline: true,
          });

          console.log('✅ Datos cargados desde Supabase');
        } catch (error) {
          console.error('❌ Error cargando desde Supabase:', error);
          set({ isOnline: false });
          throw error;
        }
      },

      addSubject: async (subject) => {
        const id = uuidv4();
        const newSubject = { ...subject, id };

        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));

        try {
          const { error } = await subjectsAPI.create({
            id,
            name: subject.name,
            color: subject.color,
            professor: subject.professor,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error creando subject en Supabase:', error);
        }
      },

      updateSubject: async (id, data) => {
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }));

        try {
          const { error } = await subjectsAPI.update(id, data);
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando subject en Supabase:', error);
        }
      },

      deleteSubject: async (id) => {
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          classes: state.classes.filter((c) => c.subjectId !== id),
          exams: state.exams.filter((e) => e.subjectId !== id),
          assignments: state.assignments.filter((a) => a.subjectId !== id),
        }));

        try {
          const { error } = await subjectsAPI.delete(id);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando subject en Supabase:', error);
        }
      },

      addClass: async (cls) => {
        const id = uuidv4();
        const newClass = { ...cls, id };

        set((state) => ({
          classes: [...state.classes, newClass],
        }));

        try {
          const { error } = await classSessionsAPI.create({
            id,
            subject_id: cls.subjectId,
            day_of_week: cls.dayOfWeek,
            start_time: cls.startTime,
            end_time: cls.endTime,
            room: cls.room,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error creando class en Supabase:', error);
        }
      },

      updateClass: async (id, data) => {
        set((state) => ({
          classes: state.classes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));

        try {
          const dbData: any = {};
          if (data.subjectId) dbData.subject_id = data.subjectId;
          if (data.dayOfWeek !== undefined) dbData.day_of_week = data.dayOfWeek;
          if (data.startTime) dbData.start_time = data.startTime;
          if (data.endTime) dbData.end_time = data.endTime;
          if (data.room) dbData.room = data.room;

          const { error } = await classSessionsAPI.update(id, dbData);
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando class en Supabase:', error);
        }
      },

      deleteClass: async (id) => {
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
        }));

        try {
          const { error } = await classSessionsAPI.delete(id);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando class en Supabase:', error);
        }
      },

      addExam: async (exam) => {
        const id = uuidv4();
        const newExam = { ...exam, id };

        set((state) => ({
          exams: [...state.exams, newExam],
        }));

        try {
          const { error } = await examsAPI.create({
            id,
            subject_id: exam.subjectId,
            date: exam.date,
            time: exam.time,
            room: exam.room,
            priority: exam.priority,
            notes: exam.notes,
          });
          if (error) throw error;

          for (const topic of exam.topics) {
            const topicId = uuidv4();
            const { error: topicError } = await examTopicsAPI.create({
              id: topicId,
              exam_id: id,
              name: topic.name,
              completed: topic.completed,
            });
            if (topicError) throw topicError;
          }
        } catch (error) {
          console.error('Error creando exam en Supabase:', error);
        }
      },

      updateExam: async (id, data) => {
        set((state) => ({
          exams: state.exams.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));

        try {
          const dbData: any = {};
          if (data.subjectId) dbData.subject_id = data.subjectId;
          if (data.date) dbData.date = data.date;
          if (data.time) dbData.time = data.time;
          if (data.room) dbData.room = data.room;
          if (data.priority) dbData.priority = data.priority;
          if (data.notes !== undefined) dbData.notes = data.notes;

          const { error } = await examsAPI.update(id, dbData);
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando exam en Supabase:', error);
        }
      },

      deleteExam: async (id) => {
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== id),
        }));

        try {
          const { error } = await examsAPI.delete(id);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando exam en Supabase:', error);
        }
      },

      toggleTopic: async (examId, topicId) => {
        const exam = get().exams.find((e) => e.id === examId);
        if (!exam) return;

        const topic = exam.topics.find((t) => t.id === topicId);
        if (!topic) return;

        const newCompleted = !topic.completed;

        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  topics: e.topics.map((t) =>
                    t.id === topicId ? { ...t, completed: newCompleted } : t
                  ),
                }
              : e
          ),
        }));

        try {
          const { error } = await examTopicsAPI.update(topicId, {
            completed: newCompleted,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando topic en Supabase:', error);
        }
      },

      addTopic: async (examId, topicName) => {
        const id = uuidv4();
        const newTopic = { id, name: topicName, completed: false };

        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId ? { ...e, topics: [...e.topics, newTopic] } : e
          ),
        }));

        try {
          const { error } = await examTopicsAPI.create({
            id,
            exam_id: examId,
            name: topicName,
            completed: false,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error creando topic en Supabase:', error);
        }
      },

      deleteTopic: async (examId, topicId) => {
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === examId
              ? { ...e, topics: e.topics.filter((t) => t.id !== topicId) }
              : e
          ),
        }));

        try {
          const { error } = await examTopicsAPI.delete(topicId);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando topic en Supabase:', error);
        }
      },

      addAssignment: async (assignment) => {
        const id = uuidv4();
        const newAssignment = { ...assignment, id, completed: false };

        set((state) => ({
          assignments: [...state.assignments, newAssignment],
        }));

        try {
          const { error } = await assignmentsAPI.create({
            id,
            subject_id: assignment.subjectId,
            title: assignment.title,
            description: assignment.description,
            due_date: assignment.dueDate,
            due_time: assignment.dueTime,
            type: assignment.type,
            priority: assignment.priority,
            completed: false,
            notes: assignment.notes,
          });
          if (error) throw error;

          for (const step of assignment.steps) {
            const stepId = uuidv4();
            const { error: stepError } = await assignmentStepsAPI.create({
              id: stepId,
              assignment_id: id,
              name: step.name,
              completed: step.completed,
            });
            if (stepError) throw stepError;
          }
        } catch (error) {
          console.error('Error creando assignment en Supabase:', error);
        }
      },

      updateAssignment: async (id, data) => {
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));

        try {
          const dbData: any = {};
          if (data.subjectId) dbData.subject_id = data.subjectId;
          if (data.title) dbData.title = data.title;
          if (data.description !== undefined) dbData.description = data.description;
          if (data.dueDate) dbData.due_date = data.dueDate;
          if (data.dueTime) dbData.due_time = data.dueTime;
          if (data.type) dbData.type = data.type;
          if (data.priority) dbData.priority = data.priority;
          if (data.completed !== undefined) dbData.completed = data.completed;
          if (data.notes !== undefined) dbData.notes = data.notes;

          const { error } = await assignmentsAPI.update(id, dbData);
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando assignment en Supabase:', error);
        }
      },

      deleteAssignment: async (id) => {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        }));

        try {
          const { error } = await assignmentsAPI.delete(id);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando assignment en Supabase:', error);
        }
      },

      toggleAssignment: async (id) => {
        const assignment = get().assignments.find((a) => a.id === id);
        if (!assignment) return;

        const newCompleted = !assignment.completed;

        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, completed: newCompleted } : a
          ),
          completedToday: newCompleted ? state.completedToday + 1 : state.completedToday,
        }));

        try {
          const { error } = await assignmentsAPI.update(id, {
            completed: newCompleted,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando assignment en Supabase:', error);
        }
      },

      toggleAssignmentStep: async (assignmentId, stepId) => {
        const assignment = get().assignments.find((a) => a.id === assignmentId);
        if (!assignment) return;

        const step = assignment.steps.find((s) => s.id === stepId);
        if (!step) return;

        const newCompleted = !step.completed;

        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  steps: a.steps.map((s) =>
                    s.id === stepId ? { ...s, completed: newCompleted } : s
                  ),
                }
              : a
          ),
        }));

        try {
          const { error } = await assignmentStepsAPI.update(stepId, {
            completed: newCompleted,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error actualizando step en Supabase:', error);
        }
      },

      addAssignmentStep: async (assignmentId, stepName) => {
        const id = uuidv4();
        const newStep = { id, name: stepName, completed: false };

        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, steps: [...a.steps, newStep] } : a
          ),
        }));

        try {
          const { error } = await assignmentStepsAPI.create({
            id,
            assignment_id: assignmentId,
            name: stepName,
            completed: false,
          });
          if (error) throw error;
        } catch (error) {
          console.error('Error creando step en Supabase:', error);
        }
      },

      deleteAssignmentStep: async (assignmentId, stepId) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? { ...a, steps: a.steps.filter((s) => s.id !== stepId) }
              : a
          ),
        }));

        try {
          const { error } = await assignmentStepsAPI.delete(stepId);
          if (error) throw error;
        } catch (error) {
          console.error('Error eliminando step en Supabase:', error);
        }
      },

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setCurrentFocusTask: (taskId) => set({ currentFocusTask: taskId }),
      setPomodoroMinutes: (minutes) => set({ pomodoroMinutes: minutes }),

      exportData: () => {
        const { subjects, classes, exams, assignments } = get();
        return JSON.stringify(
          { subjects, classes, exams, assignments, exportedAt: new Date().toISOString() },
          null,
          2
        );
      },

      importData: async (json) => {
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

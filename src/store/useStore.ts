import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, ClassSession, Exam, ExamTopic, Assignment, AssignmentStep } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  subjectsAPI,
  classSessionsAPI,
  examsAPI,
  examTopicsAPI,
  assignmentsAPI,
  assignmentStepsAPI,
  supabaseUrl,
  supabaseAnonKey,
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

  // Acciones de Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Acciones de Classes
  addClass: (cls: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (id: string, data: Partial<ClassSession>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Acciones de Exams
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  toggleTopic: (examId: string, topicId: string) => Promise<void>;
  addTopic: (examId: string, topicName: string) => Promise<void>;
  deleteTopic: (examId: string, topicId: string) => Promise<void>;

  // Acciones de Assignments
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, data: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  toggleAssignment: (id: string) => Promise<void>;
  toggleAssignmentStep: (assignmentId: string, stepId: string) => Promise<void>;
  addAssignmentStep: (assignmentId: string, stepName: string) => Promise<void>;
  deleteAssignmentStep: (assignmentId: string, stepId: string) => Promise<void>;

  // Acciones de configuración
  toggleDarkMode: () => void;
  setCurrentFocusTask: (taskId: string | null) => void;
  setPomodoroMinutes: (minutes: number) => void;

  // Export/Import
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
}

// Función para sincronizar desde Supabase
export const syncFromSupabase = async () => {
  try {
    console.log('🔄 Sincronizando desde Supabase...');
    console.log('🔑 URL:', supabaseUrl);
    console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');

    // Cargar subjects (tolerante a errores)
    let subjectsData: any[] = [];
    try {
      const { data, error } = await subjectsAPI.getAll();
      console.log('📚 Subjects - Data:', data, 'Error:', error);
      if (!error && data) subjectsData = data;
      if (error) console.error('❌ Error cargando subjects:', error);
    } catch (e) {
      console.error('❌ Excepción cargando subjects:', e);
    }

    // Cargar class_sessions
    let classesData: any[] = [];
    try {
      const { data, error } = await classSessionsAPI.getAll();
      console.log('📅 Classes - Data:', data, 'Error:', error);
      if (!error && data) classesData = data;
      if (error) console.error('❌ Error cargando classes:', error);
    } catch (e) {
      console.error('❌ Excepción cargando classes:', e);
    }

    // Cargar exams
    let examsData: any[] = [];
    try {
      const { data, error } = await examsAPI.getAll();
      console.log('📝 Exams - Data:', data, 'Error:', error);
      if (!error && data) examsData = data;
      if (error) console.error('❌ Error cargando exams:', error);
    } catch (e) {
      console.error('❌ Excepción cargando exams:', e);
    }

    // Cargar exam_topics
    let topicsData: any[] = [];
    try {
      const { data, error } = await examTopicsAPI.getAll();
      console.log('📖 Topics - Data:', data, 'Error:', error);
      if (!error && data) topicsData = data;
      if (error) console.error('❌ Error cargando topics:', error);
    } catch (e) {
      console.error('❌ Excepción cargando topics:', e);
    }

    // Cargar assignments
    let assignmentsData: any[] = [];
    try {
      const { data, error } = await assignmentsAPI.getAll();
      console.log('📋 Assignments - Data:', data, 'Error:', error);
      if (!error && data) assignmentsData = data;
      if (error) console.error('❌ Error cargando assignments:', error);
    } catch (e) {
      console.error('❌ Excepción cargando assignments:', e);
    }

    // Cargar assignment_steps
    let stepsData: any[] = [];
    try {
      const { data, error } = await assignmentStepsAPI.getAll();
      console.log('📌 Steps - Data:', data, 'Error:', error);
      if (!error && data) stepsData = data;
      if (error) console.error('❌ Error cargando steps:', error);
    } catch (e) {
      console.error('❌ Excepción cargando steps:', e);
    }

    // Transformar datos de Supabase al formato del store
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

    // Actualizar el store
    useStore.setState({
      subjects,
      classes,
      exams,
      assignments,
      isOnline: true,
    });

    console.log('✅ Sincronización completada:', {
      subjects: subjects.length,
      classes: classes.length,
      exams: exams.length,
      assignments: assignments.length,
    });
  } catch (error) {
    console.error('❌ Error sincronizando desde Supabase:', error);
    useStore.setState({ isOnline: false });
    throw error;
  }
};

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

      // ===== SUBJECTS =====
      addSubject: async (subject) => {
        const id = uuidv4();
        const newSubject = { ...subject, id };

        console.log('➕ Agregando subject:', newSubject);

        // Actualizar estado local inmediatamente
        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));

        // Sincronizar con Supabase
        try {
          console.log('📤 Enviando a Supabase...');
          const { data, error } = await subjectsAPI.create({
            id,
            name: subject.name,
            color: subject.color,
            professor: subject.professor,
          });
          console.log('📥 Respuesta de Supabase - Data:', data, 'Error:', error);
          if (error) throw error;
          console.log('✅ Subject guardado en Supabase');
        } catch (error) {
          console.error('❌ Error creando subject en Supabase:', error);
        }
      },

      updateSubject: async (id, data) => {
        // Actualizar estado local inmediatamente
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }));

        // Sincronizar con Supabase
        try {
          const { error } = await subjectsAPI.update(id, data);
          if (error) throw error;
        } catch (error) {
          console.error('Error updating subject in Supabase:', error);
        }
      },

      deleteSubject: async (id) => {
        // Actualizar estado local inmediatamente
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          classes: state.classes.filter((c) => c.subjectId !== id),
          exams: state.exams.filter((e) => e.subjectId !== id),
          assignments: state.assignments.filter((a) => a.subjectId !== id),
        }));

        // Sincronizar con Supabase (CASCADE eliminará automáticamente las relaciones)
        try {
          const { error } = await subjectsAPI.delete(id);
          if (error) throw error;
        } catch (error) {
          console.error('Error deleting subject in Supabase:', error);
        }
      },

      // ===== CLASSES =====
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
          console.error('Error creating class in Supabase:', error);
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
          console.error('Error updating class in Supabase:', error);
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
          console.error('Error deleting class in Supabase:', error);
        }
      },

      // ===== EXAMS =====
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

          // Crear topics
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
          console.error('Error creating exam in Supabase:', error);
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

          // Actualizar topics si se proporcionan
          if (data.topics) {
            // Eliminar topics antiguos
            const { data: oldTopics } = await examTopicsAPI.getByExamId(id);
            if (oldTopics) {
              for (const topic of oldTopics) {
                await examTopicsAPI.delete(topic.id);
              }
            }

            // Crear nuevos topics
            for (const topic of data.topics) {
              const topicId = topic.id || uuidv4();
              const { error: topicError } = await examTopicsAPI.create({
                id: topicId,
                exam_id: id,
                name: topic.name,
                completed: topic.completed,
              });
              if (topicError) throw topicError;
            }
          }
        } catch (error) {
          console.error('Error updating exam in Supabase:', error);
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
          console.error('Error deleting exam in Supabase:', error);
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
          console.error('Error toggling topic in Supabase:', error);
        }
      },

      addTopic: async (examId, topicName) => {
        const id = uuidv4();
        const newTopic: ExamTopic = { id, name: topicName, completed: false };

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
          console.error('Error adding topic in Supabase:', error);
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
          console.error('Error deleting topic in Supabase:', error);
        }
      },

      // ===== ASSIGNMENTS =====
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

          // Crear steps
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
          console.error('Error creating assignment in Supabase:', error);
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

          // Actualizar steps si se proporcionan
          if (data.steps) {
            const { data: oldSteps } = await assignmentStepsAPI.getByAssignmentId(id);
            if (oldSteps) {
              for (const step of oldSteps) {
                await assignmentStepsAPI.delete(step.id);
              }
            }

            for (const step of data.steps) {
              const stepId = step.id || uuidv4();
              const { error: stepError } = await assignmentStepsAPI.create({
                id: stepId,
                assignment_id: id,
                name: step.name,
                completed: step.completed,
              });
              if (stepError) throw stepError;
            }
          }
        } catch (error) {
          console.error('Error updating assignment in Supabase:', error);
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
          console.error('Error deleting assignment in Supabase:', error);
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
          console.error('Error toggling assignment in Supabase:', error);
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
          console.error('Error toggling assignment step in Supabase:', error);
        }
      },

      addAssignmentStep: async (assignmentId, stepName) => {
        const id = uuidv4();
        const newStep: AssignmentStep = { id, name: stepName, completed: false };

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
          console.error('Error adding assignment step in Supabase:', error);
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
          console.error('Error deleting assignment step in Supabase:', error);
        }
      },

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

      importData: async (json) => {
        try {
          const data = JSON.parse(json);
          if (data.subjects && data.classes && data.exams && data.assignments) {
            // Limpiar estado local
            set({
              subjects: data.subjects,
              classes: data.classes,
              exams: data.exams,
              assignments: data.assignments,
            });

            // TODO: Implementar sincronización con Supabase para import
            console.log('Datos importados localmente. Sincronización con Supabase pendiente.');
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

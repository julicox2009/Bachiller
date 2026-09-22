import { create } from 'zustand';
import { Subject, ClassSession, Exam, ExamTopic, Assignment, AssignmentStep } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getResults } from '../services/database';

interface StoreState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  assignments: Assignment[];
  darkMode: boolean;
  
  // TDAH Focus Mode
  currentFocusTask: string | null;
  setCurrentFocusTask: (taskId: string | null) => void;
  pomodoroMinutes: number;
  setPomodoroMinutes: (minutes: number) => void;
  completedToday: number;
  streak: number;

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
  
  // Assignment actions (NUEVO - Trabajos/Tareas)
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignment: (id: string) => void;
  toggleAssignmentStep: (assignmentId: string, stepId: string) => void;
  addAssignmentStep: (assignmentId: string, stepName: string) => void;
  deleteAssignmentStep: (assignmentId: string, stepId: string) => void;
  
  // Settings
  toggleDarkMode: () => void;
  // Import/Export
  exportData: () => string;
  importData: (json: string) => boolean;

  // Load from SQLite
  loadFromDatabase: () => void;
}

export const useStore = create<StoreState>()((set, get) => ({
  subjects: [],
  classes: [],
  exams: [],
  assignments: [],
  darkMode: false,
  
  // TDAH Focus Mode
  currentFocusTask: null,
  setCurrentFocusTask: (taskId) => set({ currentFocusTask: taskId }),
  pomodoroMinutes: 25,
  setPomodoroMinutes: (minutes) => set({ pomodoroMinutes: minutes }),
  completedToday: Number(localStorage.getItem('completedToday') || 0),
  streak: Number(localStorage.getItem('streak') || 0),

  // Cargar datos desde SQLite
  loadFromDatabase: () => {
    try {
      const subjects = getResults('SELECT * FROM subjects') as Subject[];
      const classes = getResults('SELECT * FROM class_sessions') as ClassSession[];
      const examsRaw = getResults('SELECT * FROM exams') as any[];
      const assignmentsRaw = getResults('SELECT * FROM assignments') as any[];
      
      // Cargar exámenes con sus topics
      const exams: Exam[] = examsRaw.map(exam => {
        const topics = getResults(
          'SELECT * FROM exam_topics WHERE exam_id = ?',
          [exam.id]
        ) as ExamTopic[];
        
        return {
          ...exam,
          topics: topics.map(t => ({ ...t, completed: Boolean(t.completed) }))
        };
      });

      // Cargar trabajos con sus steps
      const assignments: Assignment[] = assignmentsRaw.map(assignment => {
        const steps = getResults(
          'SELECT * FROM assignment_steps WHERE assignment_id = ?',
          [assignment.id]
        ) as AssignmentStep[];
        
        return {
          ...assignment,
          steps: steps.map(s => ({ ...s, completed: Boolean(s.completed) })),
          completed: Boolean(assignment.completed)
        };
      });

      // Cargar darkMode desde localStorage
      const darkMode = localStorage.getItem('darkMode') === 'true';

      set({ subjects, classes, exams, assignments, darkMode });
      console.log('✅ Datos cargados desde SQLite');
    } catch (error) {
      console.error('❌ Error cargando datos desde SQLite:', error);
    }
  },

  // Subject actions
  addSubject: (name, color, professor) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, color, professor, now, now]
    );

    set((state) => ({
      subjects: [...state.subjects, { id, name, color, professor }],
    }));
  },

  updateSubject: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    runQuery(
      `UPDATE subjects SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  deleteSubject: (id) => {
    // SQLite con CASCADE eliminará automáticamente las clases y exámenes relacionados
    runQuery('DELETE FROM subjects WHERE id = ?', [id]);

    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
      classes: state.classes.filter((c) => c.subjectId !== id),
      exams: state.exams.filter((e) => e.subjectId !== id),
    }));
  },

  // Class actions
  addClass: (cls) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, cls.subjectId, cls.dayOfWeek, cls.startTime, cls.endTime, cls.room, now, now]
    );

    set((state) => ({
      classes: [...state.classes, { ...cls, id }],
    }));
  },

  updateClass: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data).map(key => {
      const dbKey = key === 'dayOfWeek' ? 'day_of_week' : 
                    key === 'startTime' ? 'start_time' : 
                    key === 'endTime' ? 'end_time' : 
                    key === 'subjectId' ? 'subject_id' : key;
      return `${dbKey} = ?`;
    }).join(', ');
    const values = Object.values(data);
    
    runQuery(
      `UPDATE class_sessions SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    set((state) => ({
      classes: state.classes.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteClass: (id) => {
    runQuery('DELETE FROM class_sessions WHERE id = ?', [id]);

    set((state) => ({
      classes: state.classes.filter((c) => c.id !== id),
    }));
  },

  // Exam actions
  addExam: (exam) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO exams (id, subject_id, date, time, room, priority, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, exam.subjectId, exam.date, exam.time, exam.room, exam.priority, exam.notes, now, now]
    );

    // Insertar topics
    exam.topics.forEach(topic => {
      const topicId = uuidv4();
      runQuery(
        'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [topicId, id, topic.name, topic.completed ? 1 : 0, now, now]
      );
    });

    set((state) => ({
      exams: [...state.exams, { ...exam, id }],
    }));
  },

  updateExam: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data)
      .filter(key => key !== 'topics')
      .map(key => {
        const dbKey = key === 'subjectId' ? 'subject_id' : key;
        return `${dbKey} = ?`;
      }).join(', ');
    const values = Object.entries(data)
      .filter(([key]) => key !== 'topics')
      .map(([, value]) => value);
    
    if (fields) {
      runQuery(
        `UPDATE exams SET ${fields}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }

    // Actualizar topics si se proporcionan
    if (data.topics) {
      runQuery('DELETE FROM exam_topics WHERE exam_id = ?', [id]);
      data.topics.forEach(topic => {
        const topicId = topic.id || uuidv4();
        runQuery(
          'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [topicId, id, topic.name, topic.completed ? 1 : 0, now, now]
        );
      });
    }

    set((state) => ({
      exams: state.exams.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  },

  deleteExam: (id) => {
    // SQLite con CASCADE eliminará automáticamente los topics
    runQuery('DELETE FROM exams WHERE id = ?', [id]);

    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
    }));
  },

  toggleTopic: (examId, topicId) => {
    runQuery(
      'UPDATE exam_topics SET completed = 1 - completed, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), topicId]
    );

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
    }));
  },

  addTopic: (examId, topicName) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, examId, topicName, now, now]
    );

    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId
          ? {
              ...e,
              topics: [...e.topics, { id, name: topicName, completed: false }],
            }
          : e
      ),
    }));
  },

  deleteTopic: (examId, topicId) => {
    runQuery('DELETE FROM exam_topics WHERE id = ?', [topicId]);

    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId
          ? { ...e, topics: e.topics.filter((t) => t.id !== topicId) }
          : e
      ),
    }));
  },

  // Assignment actions (NUEVO - Trabajos/Tareas)
  addAssignment: (assignment) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO assignments (id, subject_id, title, description, due_date, due_time, type, priority, completed, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)',
      [id, assignment.subjectId, assignment.title, assignment.description, assignment.dueDate, assignment.dueTime, assignment.type, assignment.priority, assignment.notes, now, now]
    );

    assignment.steps.forEach(step => {
      const stepId = uuidv4();
      runQuery(
        'INSERT INTO assignment_steps (id, assignment_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
        [stepId, id, step.name, now, now]
      );
    });

    set((state) => ({
      assignments: [...state.assignments, { ...assignment, id, completed: false }],
    }));
  },

  updateAssignment: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data)
      .filter(key => key !== 'steps' && key !== 'completed')
      .map(key => {
        const dbKey = key === 'subjectId' ? 'subject_id' : 
                      key === 'dueDate' ? 'due_date' : 
                      key === 'dueTime' ? 'due_time' : key;
        return `${dbKey} = ?`;
      }).join(', ');
    const values = Object.entries(data)
      .filter(([key]) => key !== 'steps' && key !== 'completed')
      .map(([, value]) => value);
    
    if (fields) {
      runQuery(
        `UPDATE assignments SET ${fields}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }

    if (data.steps) {
      runQuery('DELETE FROM assignment_steps WHERE assignment_id = ?', [id]);
      data.steps.forEach(step => {
        const stepId = step.id || uuidv4();
        runQuery(
          'INSERT INTO assignment_steps (id, assignment_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [stepId, id, step.name, step.completed ? 1 : 0, now, now]
        );
      });
    }

    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteAssignment: (id) => {
    runQuery('DELETE FROM assignments WHERE id = ?', [id]);

    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    }));
  },

  toggleAssignment: (id) => {
    const assignment = get().assignments.find(a => a.id === id);
    if (!assignment) return;
    
    const newCompleted = !assignment.completed;
    const now = new Date().toISOString();
    
    runQuery(
      'UPDATE assignments SET completed = ?, updated_at = ? WHERE id = ?',
      [newCompleted ? 1 : 0, now, id]
    );

    // Actualizar contador TDAH
    if (newCompleted) {
      const completedToday = get().completedToday + 1;
      localStorage.setItem('completedToday', String(completedToday));
      localStorage.setItem('lastCompletedDate', new Date().toDateString());
      set({ completedToday });
    }

    set((state) => ({
      assignments: state.assignments.map((a) => 
        a.id === id ? { ...a, completed: newCompleted } : a
      ),
    }));
  },

  toggleAssignmentStep: (assignmentId, stepId) => {
    runQuery(
      'UPDATE assignment_steps SET completed = 1 - completed, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), stepId]
    );

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
    }));
  },

  addAssignmentStep: (assignmentId, stepName) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO assignment_steps (id, assignment_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, assignmentId, stepName, now, now]
    );

    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              steps: [...a.steps, { id, name: stepName, completed: false }],
            }
          : a
      ),
    }));
  },

  deleteAssignmentStep: (assignmentId, stepId) => {
    runQuery('DELETE FROM assignment_steps WHERE id = ?', [stepId]);

    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === assignmentId
          ? { ...a, steps: a.steps.filter((s) => s.id !== stepId) }
          : a
      ),
    }));
  },

  // Settings
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    set((state) => ({ darkMode: newDarkMode }));
  },

  // Import/Export
  exportData: () => {
    const { subjects, classes, exams, assignments } = get();
    return JSON.stringify({ subjects, classes, exams, assignments, exportedAt: new Date().toISOString() }, null, 2);
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.subjects && data.classes && data.exams) {
        // Limpiar base de datos
        runQuery('DELETE FROM exam_topics');
        runQuery('DELETE FROM exams');
        runQuery('DELETE FROM class_sessions');
        runQuery('DELETE FROM subjects');

        // Insertar nuevos datos
        const now = new Date().toISOString();
        
        data.subjects.forEach((s: any) => {
          runQuery(
            'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [s.id, s.name, s.color, s.professor, now, now]
          );
        });

        data.classes.forEach((c: any) => {
          runQuery(
            'INSERT INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [c.id, c.subjectId, c.dayOfWeek, c.startTime, c.endTime, c.room, now, now]
          );
        });

        data.exams.forEach((e: any) => {
          runQuery(
            'INSERT INTO exams (id, subject_id, date, time, room, priority, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [e.id, e.subjectId, e.date, e.time, e.room, e.priority, e.notes, now, now]
          );

          e.topics.forEach((t: any) => {
            runQuery(
              'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
              [t.id, e.id, t.name, t.completed ? 1 : 0, now, now]
            );
          });
        });

        // Recargar estado
        get().loadFromDatabase();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));

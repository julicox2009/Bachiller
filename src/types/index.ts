export interface Subject {
  id: string;
  name: string;
  color: string;
  professor: string;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Monday, 4 = Friday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  room: string;
  topics: ExamTopic[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

export interface ExamTopic {
  id: string;
  name: string;
  completed: boolean;
}

// NUEVO: Trabajos / Tareas a entregar
export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  type: 'homework' | 'project' | 'essay' | 'presentation' | 'lab' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  steps: AssignmentStep[];
  completed: boolean;
  notes: string;
}

export interface AssignmentStep {
  id: string;
  name: string;
  completed: boolean;
}

export const ASSIGNMENT_TYPES = {
  homework: { label: 'Deberes', emoji: '📝', color: 'bg-blue-500' },
  project: { label: 'Proyecto', emoji: '🎨', color: 'bg-purple-500' },
  essay: { label: 'Redacción', emoji: '✍️', color: 'bg-indigo-500' },
  presentation: { label: 'Presentación', emoji: '🎤', color: 'bg-pink-500' },
  lab: { label: 'Prácticas', emoji: '🔬', color: 'bg-teal-500' },
  other: { label: 'Otro', emoji: '📌', color: 'bg-gray-500' },
};

export interface AppState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  assignments: Assignment[];
  darkMode: boolean;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
export const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

export const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00'
];

export const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-green-500', textColor: 'text-green-500' },
  medium: { label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  high: { label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-500' },
};

export const SUBJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#E11D48', '#84CC16',
];

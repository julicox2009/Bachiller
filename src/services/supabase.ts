import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://tklydzedvcnkgrrtuugb.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHlkemVkdmNua2dycnR1dWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU5NzIsImV4cCI6MjEwNjEwMTk3Mn0.7epYWTmdZO6VtxyliyJQVpyUd9WfDdZDM8HPDfYcND4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las operaciones
export interface SubjectDB {
  id?: string;
  name: string;
  color: string;
  professor: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClassSessionDB {
  id?: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExamDB {
  id?: string;
  subject_id: string;
  date: string;
  time: string;
  room: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExamTopicDB {
  id?: string;
  exam_id: string;
  name: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentDB {
  id?: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  type: 'homework' | 'project' | 'essay' | 'presentation' | 'lab' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentStepDB {
  id?: string;
  assignment_id: string;
  name: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// Funciones CRUD para Subjects
export const subjectsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    return { data, error };
  },

  create: async (subject: SubjectDB) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<SubjectDB>) => {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funciones CRUD para ClassSessions
export const classSessionsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('class_sessions')
      .select('*')
      .order('day_of_week')
      .order('start_time');
    return { data, error };
  },

  create: async (session: ClassSessionDB) => {
    const { data, error } = await supabase
      .from('class_sessions')
      .insert([session])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<ClassSessionDB>) => {
    const { data, error } = await supabase
      .from('class_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('class_sessions')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funciones CRUD para Exams
export const examsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date');
    return { data, error };
  },

  create: async (exam: ExamDB) => {
    const { data, error } = await supabase
      .from('exams')
      .insert([exam])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<ExamDB>) => {
    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funciones CRUD para ExamTopics
export const examTopicsAPI = {
  getByExamId: async (examId: string) => {
    const { data, error } = await supabase
      .from('exam_topics')
      .select('*')
      .eq('exam_id', examId)
      .order('created_at');
    return { data, error };
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('exam_topics')
      .select('*')
      .order('created_at');
    return { data, error };
  },

  create: async (topic: ExamTopicDB) => {
    const { data, error } = await supabase
      .from('exam_topics')
      .insert([topic])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<ExamTopicDB>) => {
    const { data, error } = await supabase
      .from('exam_topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('exam_topics')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funciones CRUD para Assignments
export const assignmentsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date');
    return { data, error };
  },

  create: async (assignment: AssignmentDB) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<AssignmentDB>) => {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Funciones CRUD para AssignmentSteps
export const assignmentStepsAPI = {
  getByAssignmentId: async (assignmentId: string) => {
    const { data, error } = await supabase
      .from('assignment_steps')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at');
    return { data, error };
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('assignment_steps')
      .select('*')
      .order('created_at');
    return { data, error };
  },

  create: async (step: AssignmentStepDB) => {
    const { data, error } = await supabase
      .from('assignment_steps')
      .insert([step])
      .select()
      .single();
    return { data, error };
  },

  update: async (id: string, updates: Partial<AssignmentStepDB>) => {
    const { data, error } = await supabase
      .from('assignment_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('assignment_steps')
      .delete()
      .eq('id', id);
    return { error };
  }
};

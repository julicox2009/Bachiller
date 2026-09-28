-- ============================================================================
-- SCRIPT FINAL PARA SUPABASE - EJECUTAR UNA SOLA VEZ
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/project/tklydzedvcnkgrrtuugb/sql
-- 2. Copia TODO este script
-- 3. Pégalo en el editor
-- 4. Haz clic en "Run"
-- 5. Deberías ver "Success. No rows returned"
-- ============================================================================

-- 1. Crear tabla de asignaturas
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  professor TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de clases
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla de exámenes
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de temas de examen
CREATE TABLE IF NOT EXISTS exam_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear tabla de trabajos
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL,
  due_time TEXT NOT NULL DEFAULT '23:59',
  type TEXT NOT NULL DEFAULT 'homework',
  priority TEXT NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla de pasos de trabajos
CREATE TABLE IF NOT EXISTS assignment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Desactivar RLS (esto soluciona el problema de permisos)
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;

-- 8. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject ON class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_day ON class_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_exam_topics_exam ON exam_topics(exam_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_steps_assignment ON assignment_steps(assignment_id);

-- ============================================================================
-- LISTO! Si ves "Success. No rows returned", todo está configurado.
-- ============================================================================

-- ============================================================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN - EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================================================

-- PASO 1: Verificar qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- PASO 2: Crear las tablas si no existen
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  professor TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL,
  due_time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'homework',
  priority TEXT NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- PASO 4: Habilitar RLS en todas las tablas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "allow_all_subjects" ON subjects;
DROP POLICY IF EXISTS "allow_all_class_sessions" ON class_sessions;
DROP POLICY IF EXISTS "allow_all_exams" ON exams;
DROP POLICY IF EXISTS "allow_all_exam_topics" ON exam_topics;
DROP POLICY IF EXISTS "allow_all_assignments" ON assignments;
DROP POLICY IF EXISTS "allow_all_assignment_steps" ON assignment_steps;

-- PASO 6: Crear políticas que permiten TODO
CREATE POLICY "allow_all_subjects" ON subjects
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_class_sessions" ON class_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_exams" ON exams
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_exam_topics" ON exam_topics
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_assignments" ON assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_assignment_steps" ON assignment_steps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- PASO 7: Verificar que las políticas se crearon
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- PASO 8: Prueba de inserción y lectura
INSERT INTO subjects (name, color, professor)
VALUES ('Prueba Supabase', '#FF0000', 'Test')
RETURNING *;

-- Verificar que se insertó
SELECT * FROM subjects WHERE name = 'Prueba Supabase';

-- Limpiar la prueba
DELETE FROM subjects WHERE name = 'Prueba Supabase';

-- Verificar que se eliminó
SELECT * FROM subjects WHERE name = 'Prueba Supabase';

-- ============================================================================
-- SI TODOS LOS PASOS FUNCIONAN, LA CONFIGURACIÓN ESTÁ COMPLETA
-- ============================================================================

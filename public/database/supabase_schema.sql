-- ============================================================================
-- BachillerManager - Esquema para Supabase (PostgreSQL)
-- Asistente de gestión académica de Jesús
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. SQL Editor (menú izquierdo)
-- 3. Copia y pega este script COMPLETO
-- 4. Haz clic en "Run"
-- ============================================================================

-- ============================================================================
-- PASO 1: Crear tabla de asignaturas
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  professor TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 2: Crear tabla de clases (horario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 4),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 3: Crear tabla de exámenes
-- ============================================================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 4: Crear tabla de temas de examen
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 5: Crear tabla de trabajos/entregables
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL,
  due_time TEXT NOT NULL DEFAULT '23:59',
  type TEXT NOT NULL DEFAULT 'homework' CHECK (type IN ('homework', 'project', 'essay', 'presentation', 'lab', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 6: Crear tabla de pasos de trabajos
-- ============================================================================
CREATE TABLE IF NOT EXISTS assignment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 7: Crear índices para mejor rendimiento
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject ON class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_day ON class_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_exam_topics_exam ON exam_topics(exam_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_steps_assignment ON assignment_steps(assignment_id);

-- ============================================================================
-- PASO 8: Habilitar RLS (Row Level Security) - IMPORTANTE
-- ============================================================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 9: Crear políticas de acceso (permitir todo por ahora)
-- ============================================================================
-- Para una app personal, permitimos lectura y escritura a todos
-- Si quieres autenticación, podemos agregar políticas más restrictivas después

CREATE POLICY "Permitir todo para subjects" ON subjects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo para class_sessions" ON class_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo para exams" ON exams
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo para exam_topics" ON exam_topics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo para assignments" ON assignments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo para assignment_steps" ON assignment_steps
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- PASO 10: Función para actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_sessions_updated_at BEFORE UPDATE ON class_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_topics_updated_at BEFORE UPDATE ON exam_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_steps_updated_at BEFORE UPDATE ON assignment_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ¡LISTO! Si ves todos los mensajes de éxito, tu base de datos está preparada
-- ============================================================================

-- Para verificar que todo se creó correctamente, ejecuta:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

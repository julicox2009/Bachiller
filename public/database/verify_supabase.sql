-- ============================================================================
-- BachillerManager - Verificación y Configuración de Políticas RLS
-- ============================================================================
-- EJECUTA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE
-- ============================================================================

-- PASO 1: Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- PASO 2: Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- PASO 3: Ver las políticas actuales
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

-- PASO 4: Si no hay políticas o RLS no está habilitado, ejecutar esto:

-- Habilitar RLS en todas las tablas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir todo (para uso personal sin autenticación)
-- NOTA: En producción deberías usar autenticación, pero para uso personal esto funciona

-- Subjects
DROP POLICY IF EXISTS "Allow all access to subjects" ON subjects;
CREATE POLICY "Allow all access to subjects"
    ON subjects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Class Sessions
DROP POLICY IF EXISTS "Allow all access to class_sessions" ON class_sessions;
CREATE POLICY "Allow all access to class_sessions"
    ON class_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Exams
DROP POLICY IF EXISTS "Allow all access to exams" ON exams;
CREATE POLICY "Allow all access to exams"
    ON exams
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Exam Topics
DROP POLICY IF EXISTS "Allow all access to exam_topics" ON exam_topics;
CREATE POLICY "Allow all access to exam_topics"
    ON exam_topics
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Assignments
DROP POLICY IF EXISTS "Allow all access to assignments" ON assignments;
CREATE POLICY "Allow all access to assignments"
    ON assignments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Assignment Steps
DROP POLICY IF EXISTS "Allow all access to assignment_steps" ON assignment_steps;
CREATE POLICY "Allow all access to assignment_steps"
    ON assignment_steps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- PASO 5: Verificar que las políticas se crearon correctamente
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- PASO 6: Probar insertar datos de prueba
INSERT INTO subjects (id, name, color, professor) 
VALUES (
    gen_random_uuid(),
    'Prueba Supabase',
    '#FF0000',
    'Test'
);

-- Verificar que se insertó
SELECT * FROM subjects WHERE name = 'Prueba Supabase';

-- Limpiar datos de prueba
DELETE FROM subjects WHERE name = 'Prueba Supabase';

-- PASO 7: Verificar que se eliminó
SELECT * FROM subjects WHERE name = 'Prueba Supabase';

-- ============================================================================
-- Si todos los pasos funcionan, tu Supabase está configurado correctamente
-- ============================================================================

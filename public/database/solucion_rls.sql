-- ============================================================================
-- SOLUCIÓN AL PROBLEMA DE PERMISOS RLS
-- ============================================================================
-- EJECUTA ESTE SCRIPT COMPLETO EN EL SQL EDITOR DE SUPABASE
-- ============================================================================

-- PASO 1: Habilitar RLS en todas las tablas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Allow all access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow all access to class_sessions" ON class_sessions;
DROP POLICY IF EXISTS "Allow all access to exams" ON exams;
DROP POLICY IF EXISTS "Allow all access to exam_topics" ON exam_topics;
DROP POLICY IF EXISTS "Allow all access to assignments" ON assignments;
DROP POLICY IF EXISTS "Allow all access to assignment_steps" ON assignment_steps;

-- PASO 3: Crear políticas que permiten TODO (para uso personal sin autenticación)
-- NOTA: En producción deberías usar autenticación, pero para uso personal esto funciona

CREATE POLICY "Allow all access to subjects"
    ON subjects
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to class_sessions"
    ON class_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to exams"
    ON exams
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to exam_topics"
    ON exam_topics
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to assignments"
    ON assignments
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to assignment_steps"
    ON assignment_steps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- PASO 4: Verificar que las políticas se crearon correctamente
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- LISTO! Después de ejecutar este script:
-- 1. Ve a tu app en https://bachiller-bice.vercel.app
-- 2. Ve a la página "Diagnóstico"
-- 3. Ejecuta el diagnóstico nuevamente
-- 4. Todos los tests deberían pasar en verde ✅
-- ============================================================================

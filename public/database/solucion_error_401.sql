-- ============================================================================
-- SOLUCIÓN AL ERROR 401 - DESACTIVAR RLS
-- ============================================================================
-- EJECUTA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE
-- ============================================================================

-- PASO 1: Desactivar RLS en todas las tablas
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;

-- PASO 2: Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- PASO 3: Probar inserción de datos
INSERT INTO subjects (name, color, professor) 
VALUES ('Prueba Supabase', '#FF0000', 'Test') 
RETURNING *;

-- PASO 4: Verificar que se insertó
SELECT * FROM subjects WHERE name = 'Prueba Supabase';

-- PASO 5: Limpiar la prueba
DELETE FROM subjects WHERE name = 'Prueba Supabase';

-- ============================================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 1. Si el PASO 3 muestra la fila insertada → ✅ Problema resuelto
-- 2. Si el PASO 3 da error → ❌ Hay otro problema
-- ============================================================================

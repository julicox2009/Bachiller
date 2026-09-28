-- ============================================================================
-- SOLUCIÓN AL ERROR 42501 - OTORGAR PERMISOS AL ROL ANON
-- ============================================================================
-- EJECUTA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE
-- ============================================================================

-- PASO 1: Otorgar permisos SELECT (leer) al rol anon
GRANT SELECT ON public.subjects TO anon;
GRANT SELECT ON public.class_sessions TO anon;
GRANT SELECT ON public.exams TO anon;
GRANT SELECT ON public.exam_topics TO anon;
GRANT SELECT ON public.assignments TO anon;
GRANT SELECT ON public.assignment_steps TO anon;

-- PASO 2: Otorgar permisos INSERT (crear) al rol anon
GRANT INSERT ON public.subjects TO anon;
GRANT INSERT ON public.class_sessions TO anon;
GRANT INSERT ON public.exams TO anon;
GRANT INSERT ON public.exam_topics TO anon;
GRANT INSERT ON public.assignments TO anon;
GRANT INSERT ON public.assignment_steps TO anon;

-- PASO 3: Otorgar permisos UPDATE (actualizar) al rol anon
GRANT UPDATE ON public.subjects TO anon;
GRANT UPDATE ON public.class_sessions TO anon;
GRANT UPDATE ON public.exams TO anon;
GRANT UPDATE ON public.exam_topics TO anon;
GRANT UPDATE ON public.assignments TO anon;
GRANT UPDATE ON public.assignment_steps TO anon;

-- PASO 4: Otorgar permisos DELETE (eliminar) al rol anon
GRANT DELETE ON public.subjects TO anon;
GRANT DELETE ON public.class_sessions TO anon;
GRANT DELETE ON public.exams TO anon;
GRANT DELETE ON public.exam_topics TO anon;
GRANT DELETE ON public.assignments TO anon;
GRANT DELETE ON public.assignment_steps TO anon;

-- PASO 5: Desactivar RLS (por si acaso)
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;

-- PASO 6: Verificar que los permisos se otorgaron
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
ORDER BY table_name, privilege_type;

-- ============================================================================
-- DESPUÉS DE EJECUTAR ESTE SCRIPT:
-- 1. Deberías ver 24 filas (6 tablas × 4 permisos)
-- 2. Ve a tu app y ejecuta el diagnóstico nuevamente
-- 3. Debería mostrar "✅ Conexión exitosa"
-- ============================================================================

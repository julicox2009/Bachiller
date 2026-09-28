# 🔧 Solución al error 401 de Supabase

## Diagnóstico del problema

El error 401 (Unauthorized) significa que la API de Supabase está rechazando la conexión, incluso con las claves correctas.

## Posibles causas y soluciones

### Causa 1: El proyecto de Supabase está pausado

**Verificación:**
1. Ve a https://supabase.com/dashboard/
2. Busca tu proyecto `tklydzedvcnkgrrtuugb`
3. Verifica si dice "Paused" o "Active"

**Solución:**
- Si está pausado, haz clic en "Restore project"
- Los proyectos gratuitos se pausan después de 7 días de inactividad
- Tarda unos minutos en reactivarse

---

### Causa 2: Las políticas RLS están bloqueando todo acceso

**Verificación:**
1. Ve a tu proyecto en Supabase
2. Ve a **Authentication > Policies**
3. Verifica si hay políticas para cada tabla

**Solución:**
Ejecuta este SQL en el SQL Editor:

```sql
-- Desactivar RLS completamente para todas las tablas
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;
```

---

### Causa 3: Las claves API fueron regeneradas

**Verificación:**
1. Ve a **Settings > API** en Supabase
2. Compara la clave anon con la que tenemos en el código
3. Si son diferentes, la clave fue regenerada

**Solución:**
- Copia la nueva clave anon desde Supabase
- Envíamela para actualizar el código

---

### Causa 4: El proyecto fue eliminado o recreado

**Verificación:**
1. Verifica que el proyecto `tklydzedvcnkgrrtuugb` existe
2. Verifica que las tablas existen en **Table Editor**

**Solución:**
- Si el proyecto fue recreado, las claves serán diferentes
- Necesitas las nuevas claves del proyecto nuevo

---

## 🔍 Pasos de diagnóstico

### Paso 1: Verificar que el proyecto está activo
- Ve a https://supabase.com/dashboard/
- Tu proyecto debe decir "Active"

### Paso 2: Verificar que las tablas existen
- Ve a **Table Editor** en el menú lateral
- Debes ver las 6 tablas:
  - subjects
  - class_sessions
  - exams
  - exam_topics
  - assignments
  - assignment_steps

### Paso 3: Probar la API directamente
Abre esta URL en tu navegador:
```
https://tklydzedvcnkgrrtuugb.supabase.co/rest/v1/subjects?select=*
```

**Resultado esperado:**
- Si ves un JSON con datos → La API funciona
- Si ves error 401 → Problema de autenticación
- Si ves error 404 → El proyecto no existe

### Paso 4: Verificar las políticas RLS
Ejecuta este SQL en el SQL Editor:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Si no ves ninguna política, ejecuta:

```sql
-- Crear políticas permisivas para todas las tablas
CREATE POLICY "Allow all for subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for class_sessions" ON class_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for exams" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for exam_topics" ON exam_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for assignment_steps" ON assignment_steps FOR ALL USING (true) WITH CHECK (true);
```

---

## 🎯 Solución más probable

El problema más común es que **las políticas RLS están bloqueando el acceso**.

**Solución rápida:**

1. Ve a Supabase → SQL Editor
2. Ejecuta este script completo:

```sql
-- 1. Desactivar RLS
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Probar inserción
INSERT INTO subjects (name, color, professor) 
VALUES ('Prueba', '#FF0000', 'Test') 
RETURNING *;
```

3. Si el paso 3 funciona (ves la fila insertada), el problema está resuelto
4. Ve a tu app y prueba de nuevo

---

## 📋 Checklist de verificación

- [ ] El proyecto está "Active" (no "Paused")
- [ ] Las 6 tablas existen en Table Editor
- [ ] RLS está desactivado en todas las tablas
- [ ] La URL del proyecto es correcta
- [ ] La clave anon es la correcta
- [ ] La API responde en el navegador

---

## 🆘 Si nada funciona

Si después de todo esto sigue dando error 401:

1. **Regenera las claves API** en Supabase:
   - Ve a Settings > API
   - Haz clic en "Generate new key" para anon
   - Copia la nueva clave y envíamela

2. **Verifica el proyecto**:
   - Asegúrate de que el proyecto no esté pausado
   - Verifica que tengas espacio en el plan gratuito

3. **Crea un nuevo proyecto** (último recurso):
   - Crea un proyecto nuevo en Supabase
   - Ejecuta el script SQL para crear las tablas
   - Envíame las nuevas URL y clave

# 🔍 Guía de Diagnóstico - Datos no persisten en Supabase

## Problema
Los datos desaparecen cuando cierras y abres el navegador, lo que indica que los datos no se están guardando correctamente en Supabase.

## Causas Posibles

### 1. ❌ Políticas RLS no configuradas
**Síntoma:** Los datos se guardan localmente pero no en Supabase
**Solución:** Ejecutar el script `public/database/verify_supabase.sql`

### 2. ❌ Clave anon incorrecta
**Síntoma:** Errores de autenticación en la consola
**Solución:** Verificar la clave en Supabase → Settings → API

### 3. ❌ Tablas no existen
**Síntoma:** Error "relation does not exist"
**Solución:** Ejecutar el script `public/database/supabase_schema.sql`

## Pasos de Diagnóstico

### PASO 1: Abrir la consola del navegador
1. Abre tu app en el navegador
2. Presiona F12 para abrir las herramientas de desarrollador
3. Ve a la pestaña "Console"

### PASO 2: Verificar la conexión a Supabase
Busca estos mensajes en la consola:

```
🔄 Sincronizando desde Supabase...
🔑 URL: https://tklydzedvcnkgrrtuugb.supabase.co
🔑 Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si ves errores como:
- `"Failed to fetch"` → Problema de conexión
- `"JWT expired"` → Clave incorrecta o expirada
- `"relation does not exist"` → Tablas no existen

### PASO 3: Crear una asignatura de prueba
1. Ve a "Asignaturas"
2. Crea una asignatura llamada "Prueba Supabase"
3. Observa la consola

Deberías ver:
```
➕ Agregando subject: { id: '...', name: 'Prueba Supabase', ... }
📤 Enviando a Supabase...
📥 Respuesta de Supabase - Data: { ... } Error: null
✅ Subject guardado en Supabase
```

Si ves:
```
❌ Error creando subject en Supabase: { message: 'new row violates row-level security policy', ... }
```
→ **Las políticas RLS no están configuradas correctamente**

### PASO 4: Verificar en Supabase
1. Ve a tu proyecto en Supabase
2. Menú izquierdo → **Table Editor**
3. Clic en **subjects**
4. ¿Ves la asignatura "Prueba Supabase"?

**Si NO la ves:**
- Las políticas RLS no permiten INSERT
- Ejecuta el script `public/database/verify_supabase.sql`

**Si SÍ la ves:**
- La sincronización funciona
- El problema es al cargar los datos

### PASO 5: Recargar la página
1. Recarga la página (F5)
2. Observa la consola

Deberías ver:
```
🔄 Sincronizando desde Supabase...
📚 Subjects - Data: [ { id: '...', name: 'Prueba Supabase', ... } ] Error: null
```

Si ves:
```
📚 Subjects - Data: null Error: { message: '...', ... }
```
→ **Las políticas RLS no permiten SELECT**

## Solución Rápida

### Ejecutar el script de verificación

1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido de `public/database/verify_supabase.sql`
3. Ejecuta el script
4. Verifica que todos los pasos pasen sin errores

### Script rápido de políticas RLS

Si solo necesitas configurar las políticas RLS, ejecuta esto:

```sql
-- Habilitar RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir todo
CREATE POLICY "Allow all access to subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to class_sessions" ON class_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exams" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exam_topics" ON exam_topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assignment_steps" ON assignment_steps FOR ALL USING (true) WITH CHECK (true);
```

## Verificar la Clave Anon

1. Ve a Supabase → Settings → API
2. Copia la clave "anon public"
3. Verifica que sea exactamente esta:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHlkemVkdmNua2dycnR1dWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU5NzIsImV4cCI6MjEwNjEwMTk3Mn0.7epYWTmdZO6VtxyliyJQVpyUd9WfDdZDM8HPDfYcND4
```

**Nota importante:** La clave debe terminar en "dWdi" NO "dWgi"

## Checklist Final

- [ ] Abrí la consola del navegador (F12)
- [ ] Verifiqué que no hay errores de conexión
- [ ] Creé una asignatura de prueba
- [ ] Verifiqué en Supabase → Table Editor que la asignatura existe
- [ ] Recargué la página y la asignatura sigue ahí
- [ ] Ejecuté el script de políticas RLS
- [ ] Verifiqué que la clave anon es correcta

## Si nada funciona

Envíame:
1. Captura de pantalla de la consola del navegador (F12 → Console)
2. Captura de pantalla de Supabase → Table Editor → subjects
3. Mensajes de error exactos que ves en la consola

Con esa información puedo ayudarte a resolver el problema.

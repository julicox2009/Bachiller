# 🔍 Prueba directa de la API de Supabase

## Paso 1: Probar la conexión desde el navegador

Abre esta URL en tu navegador (reemplaza TU_CLAVE_ANON con tu clave real):

```
https://tklydzedvcnkgrrtuugb.supabase.co/rest/v1/subjects?select=*
```

**Agrega estos headers en la petición:**
- `apikey: TU_CLAVE_ANON_COMPLETA`
- `Authorization: Bearer TU_CLAVE_ANON_COMPLETA`

### Cómo probar con curl (terminal):

```bash
curl -X GET "https://tklydzedvcnkgrrtuugb.supabase.co/rest/v1/subjects?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHlkemVkdmNua2dycnR1dWgiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU5NzIsImV4cCI6MjEwNjEwMTk3Mn0.7epYWTmdZO6VtxyliyJQVpyUd9WfDdZDM8HPDfYcND4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHlkemVkdmNua2dycnR1dWgiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU5NzIsImV4cCI6MjEwNjEwMTk3Mn0.7epYWTmdZO6VtxyliyJQVpyUd9WfDdZDM8HPDfYcND4"
```

### Cómo probar con Postman:

1. Crea una nueva petición GET
2. URL: `https://tklydzedvcnkgrrtuugb.supabase.co/rest/v1/subjects?select=*`
3. En la pestaña **Headers**, agrega:
   - Key: `apikey`, Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu clave completa)
   - Key: `Authorization`, Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu clave completa)
4. Haz clic en **Send**

---

## Paso 2: Interpretar los resultados

### ✅ Si funciona (200 OK):
Verás un JSON con los datos:
```json
[]
```
o
```json
[{"id": "...", "name": "...", ...}]
```

**Significa:** La conexión funciona correctamente. El problema está en el código de la app.

### ❌ Si da error 401:
```json
{
  "message": "Invalid API key",
  "hint": "..."
}
```

**Significa:** La clave API es incorrecta o el proyecto está pausado.

### ❌ Si da error 404:
```json
{
  "message": "Table not found"
}
```

**Significa:** Las tablas no existen en Supabase.

---

## Paso 3: Verificar el estado del proyecto

1. Ve a https://supabase.com/dashboard/
2. Busca tu proyecto `tklydzedvcnkgrrtuugb`
3. Verifica el estado:
   - ✅ **Active** → El proyecto está funcionando
   - ⏸️ **Paused** → El proyecto está pausado (haz clic en "Restore")
   - ❌ **Deleted** → El proyecto fue eliminado

---

## Paso 4: Verificar la clave API

1. Ve a tu proyecto en Supabase
2. Menú lateral → **Settings** → **API**
3. Busca la sección **Project API keys**
4. Copia la clave **anon** **public**
5. Compara con la clave en el código:

**Clave en el código:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHlkemVkdmNua2dycnR1dWgiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU5NzIsImV4cCI6MjEwNjEwMTk3Mn0.7epYWTmdZO6VtxyliyJQVpyUd9WfDdZDM8HPDfYcND4
```

**¿Son iguales?** 
- ✅ Sí → La clave es correcta
- ❌ No → La clave fue regenerada, actualiza el código

---

## Paso 5: Ejecutar el script de solución

Si la prueba directa funciona pero la app no, ejecuta este SQL en Supabase:

```sql
-- Desactivar RLS en todas las tablas
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_steps DISABLE ROW LEVEL SECURITY;
```

---

## Paso 6: Usar la página de diagnóstico

1. Ve a tu app en https://bachiller-bice.vercel.app
2. Haz clic en **Diagnóstico** en el menú lateral
3. Haz clic en **Ejecutar Diagnóstico**
4. Revisa los resultados:
   - ✅ **Conexión directa (fetch)** → La API funciona
   - ✅ **Conexión con cliente Supabase** → El cliente funciona
   - ❌ **Error en alguna prueba** → Sigue las instrucciones en pantalla

---

## 🎯 Resumen de problemas comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Error 401 | Clave incorrecta | Verifica la clave en Settings > API |
| Error 401 | Proyecto pausado | Restaura el proyecto en el dashboard |
| Error 404 | Tablas no existen | Ejecuta el script SQL para crearlas |
| Error 403 | RLS bloqueando | Ejecuta el script para desactivar RLS |
| Funciona en prueba directa pero no en la app | Problema en el código | Revisa la configuración del cliente |

---

## 📞 Si nada funciona

Envíame:
1. Captura de pantalla del resultado de la prueba con curl/Postman
2. Captura de pantalla del estado del proyecto en Supabase
3. Resultado completo del diagnóstico en la app

Con esa información podré identificar exactamente qué está fallando.

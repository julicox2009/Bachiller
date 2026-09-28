# 🔑 Cómo obtener tu clave API de Supabase

## Paso 1: Ir a tu proyecto de Supabase

1. Abre tu navegador y ve a: https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `tklydzedvcnkgrrtuugb`

## Paso 2: Ir a la configuración de API

1. En el menú lateral izquierdo, busca el ícono de **Settings** (⚙️)
2. Haz clic en **API**

## Paso 3: Copiar la clave anon

1. Verás una sección llamada **Project API keys**
2. Busca la clave que dice **anon** **public**
3. Haz clic en el botón **Copy** (📋) para copiar la clave completa

La clave tiene este formato:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

Es muy larga (más de 200 caracteres).

## Paso 4: Verificar la URL del proyecto

En la misma página de API, arriba verás la **URL** de tu proyecto:
```
https://tklydzedvcnkgrrtuugb.supabase.co
```

Copia esta URL también.

## Paso 5: Enviarme la información

Una vez que tengas ambas cosas:
- ✅ URL del proyecto
- ✅ Clave anon (public)

Envíamelas en el chat y actualizaré el código.

---

## ⚠️ Importante

- La clave **anon** es **pública** y segura para usar en el frontend
- NO uses la clave **service_role** (esa es secreta)
- La clave anon permite acceso público a tu base de datos
- Las políticas RLS (Row Level Security) controlan qué se puede acceder

---

## 🔍 ¿Por qué da error 401?

El error 401 (Unauthorized) significa que:
- La clave API es incorrecta
- La clave API expiró
- La clave API fue regenerada

Esto puede pasar si:
- Regeneraste las claves en Supabase
- El proyecto fue recreado
- Hay un error de tipeo en la clave

---

## ✅ Solución

Una vez que me envíes la clave correcta, actualizaré el archivo `src/services/supabase.ts` con:
- La URL correcta
- La clave anon correcta

Y la sincronización con Supabase funcionará.

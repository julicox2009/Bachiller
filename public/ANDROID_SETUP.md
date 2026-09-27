# 📱 Guía de Instalación en Android - BachillerManager

## 🎯 Tienes 3 opciones para usar la app en Android

---

## ✅ OPCIÓN 1: PWA Instalable (La más fácil - RECOMENDADA)

**Tiempo:** 5 minutos  
**Dificultad:** Muy fácil  
**Resultado:** App instalada desde el navegador

### Pasos:

1. **Sube la app a un hosting gratuito** (elige uno):

   **Opción A: Vercel (Recomendado)**
   ```bash
   # Instala Vercel CLI
   npm install -g vercel
   
   # En la carpeta del proyecto
   vercel
   
   # Sigue las instrucciones (acepta los defaults)
   # Te dará una URL como: https://bachiller-manager.vercel.app
   ```

   **Opción B: Netlify**
   - Ve a https://netlify.com
   - Arrastra la carpeta `dist/` al dashboard
   - Te dará una URL como: https://bachiller-manager.netlify.app

   **Opción C: GitHub Pages**
   ```bash
   npm install -D gh-pages
   # Agrega en package.json:
   # "homepage": "https://TU-USUARIO.github.io/bachiller-manager"
   # "scripts": { "predeploy": "npm run build", "deploy": "gh-pages -d dist" }
   
   npm run deploy
   ```

2. **Abre la URL en tu Android** (Chrome recomendado)

3. **Instala la app:**
   - Opción A: Aparecerá un banner automático "Añadir a pantalla principal"
   - Opción B: Menú ⋮ → "Añadir a pantalla principal" o "Instalar aplicación"
   - Opción C: Menú ⋮ → "Instalar aplicación"

4. **¡Listo!** La app aparecerá como una app normal en tu teléfono

### Ventajas:
- ✅ Funciona offline
- ✅ Se instala como app nativa
- ✅ Notificaciones push
- ✅ Sin necesidad de Play Store
- ✅ Se actualiza automáticamente

---

## ✅ OPCIÓN 2: APK con PWABuilder (Más profesional)

**Tiempo:** 15 minutos  
**Dificultad:** Fácil  
**Resultado:** Archivo .APK instalable

### Pasos:

1. **Sube la app a un hosting** (ver Opción 1)

2. **Ve a PWABuilder:**
   - https://www.pwabuilder.com/

3. **Ingresa la URL de tu app**
   - Ejemplo: https://bachiller-manager.vercel.app

4. **Haz clic en "Package for stores"**

5. **Selecciona "Android"**

6. **Configura:**
   - Package name: `com.jesus.bachillermanager`
   - App name: `BachillerManager`
   - Launcher name: `BachillerManager`
   - Icon URL: (usar el icono por defecto)
   - Signing key: (generar uno nuevo)

7. **Descarga el APK**

8. **Instala en tu Android:**
   - Transfiere el archivo `.apk` a tu teléfono
   - Configura → Seguridad → Permitir "Fuentes desconocidas"
   - Abre el archivo APK e instala

### Ventajas:
- ✅ Archivo APK distribuible
- ✅ Puedes compartirlo con otros
- ✅ No necesitas Play Store
- ✅ Funciona offline

---

## ✅ OPCIÓN 3: Capacitor (App nativa completa)

**Tiempo:** 1-2 horas  
**Dificultad:** Media  
**Resultado:** APK profesional con acceso a APIs nativas

### Requisitos:
- Android Studio instalado
- Java JDK 11+
- Node.js 18+

### Pasos:

1. **Instala Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "BachillerManager" "com.jesus.bachillermanager"
   ```

2. **Construye la app:**
   ```bash
   npm run build
   ```

3. **Agrega la plataforma Android:**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

4. **Sincroniza los archivos:**
   ```bash
   npx cap sync
   ```

5. **Abre en Android Studio:**
   ```bash
   npx cap open android
   ```

6. **En Android Studio:**
   - Espera a que termine de indexar
   - Conecta tu teléfono Android (con modo desarrollador activado)
   - O usa un emulador
   - Haz clic en "Run" (▶️)

7. **Generar APK firmado:**
   - Build → Generate Signed Bundle / APK
   - Selecciona "APK"
   - Crea una nueva keystore (guarda la contraseña!)
   - Selecciona "release"
   - Build → Finish
   - El APK estará en: `android/app/release/app-release.apk`

### Ventajas:
- ✅ App 100% nativa
- ✅ Acceso a todas las APIs de Android
- ✅ Puedes publicarla en Play Store
- ✅ Mejor rendimiento
- ✅ Notificaciones push nativas

### Configuración adicional para Play Store:

Si quieres publicarla en Google Play:

1. **Crea una cuenta de desarrollador** ($25 USD único)
   - https://play.google.com/console

2. **Prepara los assets:**
   - Icono 512x512 PNG
   - Screenshots (mínimo 2)
   - Descripción de la app
   - Política de privacidad

3. **Genera AAB (Android App Bundle):**
   ```bash
   # En Android Studio
   Build → Generate Signed Bundle / APK
   # Selecciona "Android App Bundle"
   ```

4. **Sube a Play Console**

---

## 🔧 Configuración del teléfono Android

### Para instalar APKs de fuentes desconocidas:

**Android 8.0+:**
1. Configuración → Seguridad
2. "Instalar apps desconocidas"
3. Selecciona el navegador/archivos
4. Activa "Permitir desde esta fuente"

**Android 7.0 o inferior:**
1. Configuración → Seguridad
2. Activa "Fuentes desconocidas"

### Para modo desarrollador (necesario para Capacitor):
1. Configuración → Acerca del teléfono
2. Toca 7 veces "Número de compilación"
3. Vuelve a Configuración → Opciones de desarrollador
4. Activa "Depuración USB"

---

## 📊 Comparación de opciones

| Característica | PWA | APK (PWABuilder) | APK (Capacitor) |
|----------------|-----|------------------|-----------------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Tiempo | 5 min | 15 min | 1-2 horas |
| Offline | ✅ | ✅ | ✅ |
| Notificaciones | ✅ | ✅ | ✅✅ |
| Play Store | ❌ | ❌ | ✅ |
| APIs nativas | ❌ | ❌ | ✅ |
| Actualizaciones | Auto | Manual | Manual |
| Tamaño | ~2 MB | ~5 MB | ~10 MB |

---

## 🚀 Mi recomendación

### Para uso personal:
**→ OPCIÓN 1 (PWA)**
- Es la más rápida y fácil
- Funciona perfectamente
- Se actualiza sola

### Para distribuir a compañeros:
**→ OPCIÓN 2 (APK con PWABuilder)**
- Puedes compartir el archivo
- No necesitas Play Store
- Relativamente fácil

### Para publicar en Play Store:
**→ OPCIÓN 3 (Capacitor)**
- Es el estándar profesional
- Acceso completo a APIs nativas
- Requiere más trabajo inicial

---

## ❓ Problemas comunes

### "La app no se instala"
- Verifica que tienes espacio en el teléfono
- Activa "Fuentes desconocidas"
- Descarga el APK nuevamente

### "No funciona offline"
- Asegúrate de haber abierto la app al menos una vez con internet
- Verifica que el Service Worker está registrado (Console del navegador)

### "Las notificaciones no aparecen"
- Permite notificaciones en el navegador
- En Android: Configuración → Apps → Chrome → Notificaciones → Permitir

### "La app se ve pequeña en tablet"
- La app es responsive, debería adaptarse
- Si usas PWA, prueba rotar la pantalla

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas con algún paso, puedes:
1. Consultar la documentación oficial de Capacitor: https://capacitorjs.com/docs
2. Preguntar en Stack Overflow con el tag "capacitor"
3. ¡Preguntarme a mí! Puedo guiarte paso a paso

---

**¡Listo! Ahora tienes BachillerManager en tu Android 🎉**

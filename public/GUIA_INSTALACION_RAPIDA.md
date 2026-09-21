# 📦 GUÍA COMPLETA DE INSTALACIÓN - BachillerManager

## 🚀 PASO 1: Crear estructura de carpetas

```bash
mkdir bachiller-manager
cd bachiller-manager
mkdir -p src/types src/store src/components src/pages
```

## 🚀 PASO 2: Crear package.json

```bash
npm init -y
```

Luego edita `package.json` y agrega estas dependencias:

```json
{
  "name": "bachiller-manager",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

## 🚀 PASO 3: Instalar dependencias

```bash
npm install
```

## 🚀 PASO 4: Copiar archivos

Copia el contenido de cada archivo desde los archivos:
- `public/CONTENIDO_COMPLETO_PARTE1.md` (archivos 1-6)
- `public/CONTENIDO_COMPLETO_PARTE2.md` (archivos 7-8)
- Los componentes y páginas están en `src/components/` y `src/pages/`

## 🚀 PASO 5: Ejecutar

```bash
npm run dev
```

Abre: http://localhost:3000

---

## 📋 LISTA DE ARCHIVOS ESENCIALES (17 archivos)

### Configuración (3 archivos)
1. ✅ `index.html`
2. ✅ `tsconfig.json`
3. ✅ `vite.config.js`

### Código fuente (14 archivos)
4. ✅ `src/main.tsx`
5. ✅ `src/App.tsx`
6. ✅ `src/index.css`
7. ✅ `src/types/index.ts`
8. ✅ `src/store/useStore.ts`
9. ✅ `src/components/Layout.tsx`
10. ✅ `src/components/WelcomeScreen.tsx`
11. ✅ `src/pages/Dashboard.tsx`
12. ✅ `src/pages/Schedule.tsx`
13. ✅ `src/pages/Exams.tsx`
14. ✅ `src/pages/Subjects.tsx`
15. ✅ `src/pages/Settings.tsx`

---

## 💡 ALTERNATIVA MÁS FÁCIL

Si quieres evitar copiar manualmente, puedes:

1. **Descargar todos los archivos de este proyecto** (si hay botón de descarga)
2. **O copiar los archivos uno por uno** desde las carpetas `src/` de este proyecto

Los archivos ya están creados y funcionando. Solo necesitas copiarlos a tu computadora local.

---

## 🆘 ¿NECESITAS AYUDA?

Si tienes problemas con algún archivo específico, dime cuál y te lo muestro completo.

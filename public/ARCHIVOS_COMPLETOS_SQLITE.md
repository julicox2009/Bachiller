# 📦 ARCHIVOS COMPLETOS DE BACHILLERMANAGER CON SQLITE

## 📋 LISTA DE 18 ARCHIVOS

### Configuración (3 archivos)
1. `index.html`
2. `tsconfig.json`
3. `vite.config.js`

### Código fuente (15 archivos)
4. `src/main.tsx`
5. `src/App.tsx`
6. `src/index.css`
7. `src/types/index.ts`
8. `src/services/database.ts` ← NUEVO (SQLite)
9. `src/store/useStore.ts` ← MODIFICADO (usa SQLite)
10. `src/components/Layout.tsx`
11. `src/components/WelcomeScreen.tsx`
12. `src/pages/Dashboard.tsx`
13. `src/pages/Schedule.tsx`
14. `src/pages/Exams.tsx`
15. `src/pages/Subjects.tsx`
16. `src/pages/Settings.tsx`

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### Paso 1: Crear estructura
```bash
mkdir bachiller-manager
cd bachiller-manager
mkdir -p src/types src/services src/store src/components src/pages
```

### Paso 2: Crear package.json
```bash
npm init -y
```

Edita `package.json` y agrega:
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
    "uuid": "^9.0.0",
    "sql.js": "^1.9.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.0",
    "@types/sql.js": "^1.4.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

### Paso 3: Instalar dependencias
```bash
npm install
```

### Paso 4: Copiar los 18 archivos
Copia el contenido de cada archivo desde este documento.

### Paso 5: Ejecutar
```bash
npm run dev
```

Abre: http://localhost:3000

---

## ✅ CARACTERÍSTICAS CON SQLITE

- ✅ Base de datos SQLite real (no localStorage)
- ✅ Funciona 100% offline
- ✅ Persistencia de datos
- ✅ Compatible con PWA/Android
- ✅ Mismo esquema SQL que los archivos .sql
- ✅ Pantalla de carga al inicializar
- ✅ Import/Export JSON

---

Los archivos están en las siguientes partes:
- PARTE 1: Configuración (archivos 1-3)
- PARTE 2: Código base (archivos 4-9)
- PARTE 3: Componentes (archivos 10-11)
- PARTE 4: Páginas (archivos 12-16)

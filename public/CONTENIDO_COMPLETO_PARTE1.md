# 📦 CONTENIDO COMPLETO DE ARCHIVOS - BachillerManager

Copia cada archivo en la ruta indicada.

---

## 📄 ARCHIVO 1: `index.html` (raíz del proyecto)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BachillerManager - Asistente de gestión académica de Jesús</title>
    <meta name="description" content="BachillerManager: Asistente de gestión académica de Jesús. Horario, exámenes y dashboard offline." />
    <meta name="theme-color" content="#3B82F6" />
    <style>
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 ARCHIVO 2: `tsconfig.json` (raíz del proyecto)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
```

---

## 📄 ARCHIVO 3: `vite.config.js` (raíz del proyecto)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
```

---

## 📄 ARCHIVO 4: `src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

---

## 📄 ARCHIVO 5: `src/index.css`

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

/* Smooth transitions for dark mode */
* {
  transition-property: background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

/* Prevent transition on page load */
.no-transition * {
  transition: none !important;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease forwards;
}

/* Table styles */
table {
  border-collapse: collapse;
}

/* Focus styles */
input:focus, select:focus, textarea:focus, button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Mobile tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* PWA standalone mode padding */
@media (display-mode: standalone) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## 📄 ARCHIVO 6: `src/types/index.ts`

```typescript
export interface Subject {
  id: string;
  name: string;
  color: string;
  professor: string;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Monday, 4 = Friday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  room: string;
  topics: ExamTopic[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

export interface ExamTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface AppState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  darkMode: boolean;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
export const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

export const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00'
];

export const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-green-500', textColor: 'text-green-500' },
  medium: { label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  high: { label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-500' },
};

export const SUBJECT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#E11D48', '#84CC16',
];
```

---

Continuará en el siguiente mensaje con los archivos restantes...

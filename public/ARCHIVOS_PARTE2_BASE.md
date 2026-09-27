# 📦 PARTE 2: Archivos de Código Base

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

* {
  transition-property: background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.no-transition * {
  transition: none !important;
}

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

table {
  border-collapse: collapse;
}

input:focus, select:focus, textarea:focus, button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

* {
  -webkit-tap-highlight-color: transparent;
}

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
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string;
  time: string;
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

**Continúa en PARTE 3 con App.tsx, database.ts y useStore.ts...**

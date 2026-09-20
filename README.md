# 📚 AcademicManager - Gestión Académica

Aplicación web multiplataforma de gestión académica que funciona 100% offline. Diseñada para ejecutarse en dispositivos móviles Android y ordenadores PC (Windows/Linux/macOS).

## 🚀 Características

### Funcionalidades Principales
- **Dashboard**: Vista principal con las clases del día y exámenes próximos (14 días)
- **Horario Semanal**: Vista interactiva de lunes a viernes con asignación de asignatura, aula, profesor y horarios
- **Calendario de Exámenes**: Agendar exámenes con fecha, hora, materia, temas y nivel de prioridad
- **Modo Estudio**: Asociar temas al examen e ir tachando lo ya repasado
- **Código de Colores**: Color personalizado por asignatura para identificación visual

### Características Adicionales
- **Modo Oscuro/Claro**: Soporte completo para ambos temas
- **Notificaciones Locales**: Recordatorios 15 min antes de clases y 24-48h antes de exámenes
- **Cuenta Regresiva**: Contador visual en exámenes ("Faltan 3 días", "Mañana", "¡Hoy!")
- **Importación/Exportación**: Respaldo en JSON para migrar entre dispositivos
- **100% Offline**: Todos los datos se almacenan localmente (localStorage)
- **Diseño Responsive**: Adaptable a móvil, tablet y escritorio

## 🏗️ Arquitectura del Proyecto

```
src/
├── App.tsx                    # Componente principal con routing
├── main.tsx                   # Punto de entrada
├── index.css                  # Estilos globales + Tailwind
├── types/
│   └── index.ts              # Tipos TypeScript y constantes
├── store/
│   └── useStore.ts           # Estado global con Zustand + persistencia
├── components/
│   ├── Layout.tsx            # Layout con sidebar responsive
│   └── WelcomeScreen.tsx     # Pantalla de bienvenida
└── pages/
    ├── Dashboard.tsx         # Vista principal
    ├── Schedule.tsx          # Horario semanal
    ├── Exams.tsx             # Gestión de exámenes
    ├── Subjects.tsx          # Gestión de asignaturas
    └── Settings.tsx          # Configuración y datos
```

## 📊 Modelo de Datos

### Subject (Asignatura)
```typescript
interface Subject {
  id: string;          // UUID
  name: string;        // Nombre de la asignatura
  color: string;       // Color hexadecimal (#RRGGBB)
  professor: string;   // Nombre del profesor
}
```

### ClassSession (Clase)
```typescript
interface ClassSession {
  id: string;          // UUID
  subjectId: string;   // FK → Subject
  dayOfWeek: number;   // 0=Lunes, 4=Viernes
  startTime: string;   // Formato HH:mm
  endTime: string;     // Formato HH:mm
  room: string;        // Aula/sala
}
```

### Exam (Examen)
```typescript
interface Exam {
  id: string;          // UUID
  subjectId: string;   // FK → Subject
  date: string;        // Formato YYYY-MM-DD
  time: string;        // Formato HH:mm
  room: string;        // Aula del examen
  topics: ExamTopic[]; // Temas a estudiar
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;       // Notas adicionales
}
```

### ExamTopic (Tema de Examen)
```typescript
interface ExamTopic {
  id: string;          // UUID
  name: string;        // Nombre del tema
  completed: boolean;  // Si ya fue repasado
}
```

## 🛠️ Tecnologías

| Tecnología | Propósito |
|-----------|-----------|
| React 18 | Framework UI |
| TypeScript | Tipado estático |
| Tailwind CSS 4 | Estilos utilitarios |
| Zustand | Estado global + persistencia |
| date-fns | Manejo de fechas |
| Lucide React | Iconografía |
| Vite | Build tool |

## 📦 Compilación y Ejecución

### Requisitos
- Node.js 18+ 
- npm 9+

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador.

### Compilación para Producción
```bash
npm run build
```
Los archivos se generan en `dist/`.

### Verificación de Tipos
```bash
npm run typecheck
```

## 📱 Ejecución en Diferentes Plataformas

### En PC (Windows/Linux/macOS)
1. Ejecuta `npm run dev` y abre en el navegador
2. Opcionalmente, instala como PWA desde el menú del navegador

### En Android
1. Abre la URL en Chrome
2. Menú → "Agregar a pantalla de inicio"
3. La app se instala como PWA y funciona offline

### Como App de Escritorio (Electron - opcional)
```bash
npm install electron electron-builder --save-dev
# Configurar main.js de Electron para cargar dist/index.html
npx electron .
```

## 💾 Persistencia de Datos

Los datos se almacenan en `localStorage` del navegador bajo la clave `academic-manager-storage`.

### Exportar datos
Desde Ajustes → "Exportar datos" se genera un archivo JSON con toda la información.

### Importar datos
Desde Ajustes → "Importar datos" se restaura desde un archivo JSON previamente exportado.

## 🔔 Notificaciones

La app usa la API de Notificaciones del navegador:
- **Clases**: Aviso 15 minutos antes del inicio
- **Exámenes**: Aviso 24h antes (todos) y 48h antes (urgentes)
- Requiere que la pestaña esté abierta para funcionar

## 📄 Licencia

MIT

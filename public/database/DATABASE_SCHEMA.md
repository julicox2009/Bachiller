# 📊 BachillerManager - Diagrama de Base de Datos

## Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUBJECTS (Asignaturas)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  id              TEXT PRIMARY KEY (UUID)                                │
│  name            TEXT NOT NULL UNIQUE                                   │
│  color           TEXT NOT NULL DEFAULT '#3B82F6'                        │
│  professor       TEXT NOT NULL DEFAULT ''                               │
│  created_at      TEXT NOT NULL                                          │
│  updated_at      TEXT NOT NULL                                          │
└─────────────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1:N                                │ 1:N
         │                                    │
         ▼                                    ▼
┌─────────────────────────────┐    ┌─────────────────────────────────────┐
│   CLASS_SESSIONS (Clases)    │    │         EXAMS (Exámenes)            │
├─────────────────────────────┤    ├─────────────────────────────────────┤
│  id            TEXT PK      │    │  id              TEXT PK            │
│  subject_id    TEXT FK ─────┘    │  subject_id      TEXT FK ───────────┘
│  day_of_week   INTEGER (0-4)│    │  date            TEXT (YYYY-MM-DD)  │
│  start_time    TEXT (HH:mm) │    │  time            TEXT (HH:mm)       │
│  end_time      TEXT (HH:mm) │    │  room            TEXT               │
│  room          TEXT         │    │  priority        TEXT ENUM          │
│  created_at    TEXT         │    │  notes           TEXT               │
│  updated_at    TEXT         │    │  reminder_sent_24h INTEGER (0/1)    │
└─────────────────────────────┘    │  reminder_sent_48h INTEGER (0/1)    │
                                   │  created_at      TEXT               │
                                   │  updated_at      TEXT               │
                                   └─────────────────────────────────────┘
                                              │
                                              │ 1:N
                                              │
                                              ▼
                                   ┌─────────────────────────────────────┐
                                   │      EXAM_TOPICS (Temas)            │
                                   ├─────────────────────────────────────┤
                                   │  id            TEXT PK              │
                                   │  exam_id       TEXT FK ─────────────┘
                                   │  name          TEXT                 │
                                   │  completed     INTEGER (0/1)        │
                                   │  sort_order    INTEGER              │
                                   │  created_at    TEXT                 │
                                   │  updated_at    TEXT                 │
                                   └─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          SETTINGS (Configuración)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  key             TEXT PRIMARY KEY                                       │
│  value           TEXT NOT NULL                                          │
│  updated_at      TEXT NOT NULL                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION_LOG (Registro)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  id                INTEGER PRIMARY KEY AUTOINCREMENT                    │
│  entity_type       TEXT ENUM ('class', 'exam')                          │
│  entity_id         TEXT                                                 │
│  notification_type TEXT                                                 │
│  sent_at           TEXT                                                 │
│  UNIQUE(entity_type, entity_id, notification_type)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Relaciones

| Origen | Destino | Tipo | Acción al eliminar |
|--------|---------|------|-------------------|
| subjects | class_sessions | 1:N | CASCADE (eliminar clases) |
| subjects | exams | 1:N | CASCADE (eliminar exámenes) |
| exams | exam_topics | 1:N | CASCADE (eliminar temas) |

## Restricciones (Constraints)

### subjects
- `name` debe ser único
- `color` formato: `#RRGGBB`

### class_sessions
- `day_of_week`: 0-4 (Lunes a Viernes)
- `start_time` y `end_time`: formato HH:mm
- `end_time > start_time`
- No permitir solapamiento de horarios (trigger)

### exams
- `date`: formato YYYY-MM-DD
- `time`: formato HH:mm
- `priority`: ENUM ('low', 'medium', 'high', 'urgent')

### exam_topics
- `completed`: 0 o 1 (booleano)

## Índices para Optimización

| Tabla | Índice | Columnas |
|-------|--------|----------|
| subjects | idx_subjects_name | name |
| class_sessions | idx_class_sessions_day | day_of_week |
| class_sessions | idx_class_sessions_subject | subject_id |
| class_sessions | idx_class_sessions_day_time | day_of_week, start_time |
| exams | idx_exams_date | date |
| exams | idx_exams_subject | subject_id |
| exams | idx_exams_priority | priority |
| exams | idx_exams_date_priority | date, priority |
| exam_topics | idx_exam_topics_exam | exam_id |
| exam_topics | idx_exam_topics_completed | exam_id, completed |

## Flujo de Datos Típico

### 1. Crear Asignatura
```
Usuario → Formulario → INSERT subjects → Actualizar UI
```

### 2. Agregar Clase al Horario
```
Usuario → Seleccionar día/hora → Verificar solapamiento → INSERT class_sessions → Actualizar grilla
```

### 3. Programar Examen
```
Usuario → Formulario → INSERT exams → Agregar temas → INSERT exam_topics → Actualizar lista
```

### 4. Modo Estudio
```
Usuario → Seleccionar examen → Mostrar temas → UPDATE exam_topics.completed → Actualizar progreso
```

### 5. Notificaciones
```
Timer (cada minuto) → Verificar clases/exámenes próximos → INSERT notification_log → Mostrar notificación
```

## Ejemplos de Consultas Comunes

### Dashboard - Clases del día
```sql
SELECT cs.*, s.name, s.color, s.professor
FROM class_sessions cs
JOIN subjects s ON cs.subject_id = s.id
WHERE cs.day_of_week = ?  -- 0-4
ORDER BY cs.start_time;
```

### Dashboard - Próximos exámenes
```sql
SELECT e.*, s.name, s.color,
       julianday(e.date) - julianday('now') AS days_left
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.date >= date('now')
  AND e.date <= date('now', '+14 days')
ORDER BY e.date, e.priority DESC;
```

### Progreso de estudio
```sql
SELECT
  exam_id,
  COUNT(*) AS total,
  SUM(completed) AS done,
  ROUND(100.0 * SUM(completed) / COUNT(*), 1) AS percentage
FROM exam_topics
WHERE exam_id = ?
GROUP BY exam_id;
```

## Consideraciones de Rendimiento

1. **WAL Mode**: Habilitado para mejor rendimiento en lecturas concurrentes
2. **Foreign Keys**: Activadas para integridad referencial
3. **Índices**: Creados en columnas frecuentemente consultadas
4. **Triggers**: Para mantener `updated_at` y validar solapamientos
5. **Transacciones**: Usar para operaciones múltiples (import/export)

## Migración entre Plataformas

### De Web (localStorage) a SQLite
```javascript
// Exportar desde web
const data = JSON.parse(localStorage.getItem('bachiller-manager-storage'));

// Importar a SQLite (Flutter/React Native/Electron)
for (const subject of data.state.subjects) {
  db.insert('subjects', subject);
}
// ... repetir para classes, exams
```

### De SQLite a Web
```javascript
// Exportar desde SQLite
const subjects = db.all('SELECT * FROM subjects');
const classes = db.all('SELECT * FROM class_sessions');
const exams = db.all('SELECT * FROM exams');

// Importar a localStorage
const data = {
  state: { subjects, classes, exams }
};
localStorage.setItem('bachiller-manager-storage', JSON.stringify(data));
```

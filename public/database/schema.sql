-- ============================================================================
-- BachillerManager - Esquema de Base de Datos SQLite
-- Asistente de gestión académica de Jesús
-- ============================================================================
-- Versión: 1.0.0
-- Motor: SQLite 3.35+
-- Descripción: Schema completo para la aplicación de gestión académica
--              compatible con Android (Room/SQLite), Desktop (Better-SQLite3)
--              y Flutter (Drift/sqflite).
-- ============================================================================

PRAGMA journal_mode = WAL;           -- Mejor rendimiento en lecturas/escrituras
PRAGMA foreign_keys = ON;            -- Habilitar integridad referencial
PRAGMA recursive_triggers = ON;      -- Permitir triggers recursivos si se necesitan

-- ============================================================================
-- TABLA 1: subjects (Asignaturas / Materias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
    id              TEXT PRIMARY KEY,                              -- UUID v4
    name            TEXT NOT NULL UNIQUE,                          -- Nombre de la asignatura
    color           TEXT NOT NULL DEFAULT '#3B82F6',               -- Color hexadecimal (#RRGGBB)
    professor       TEXT NOT NULL DEFAULT '',                      -- Nombre del profesor
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Índice para búsquedas rápidas por nombre
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- ============================================================================
-- TABLA 2: class_sessions (Clases / Sesiones del horario)
-- ============================================================================
CREATE TABLE IF NOT EXISTS class_sessions (
    id              TEXT PRIMARY KEY,                              -- UUID v4
    subject_id      TEXT NOT NULL,                                 -- FK → subjects.id
    day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 4), -- 0=Lunes, 4=Viernes
    start_time      TEXT NOT NULL CHECK (start_time GLOB '[0-2][0-9]:[0-5][0-9]'), -- Formato HH:mm
    end_time        TEXT NOT NULL CHECK (end_time GLOB '[0-2][0-9]:[0-5][0-9]'),   -- Formato HH:mm
    room            TEXT NOT NULL DEFAULT '',                      -- Aula / sala
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- Restricción: la hora de fin debe ser posterior a la de inicio
    CHECK (end_time > start_time),

    -- Clave foránea con eliminación en cascada
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Índices para consultas del horario
CREATE INDEX IF NOT EXISTS idx_class_sessions_day ON class_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_sessions_subject ON class_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_day_time ON class_sessions(day_of_week, start_time);

-- Restricción: no permitir clases que se solapen en el mismo día y hora
CREATE TRIGGER IF NOT EXISTS trg_class_sessions_no_overlap
BEFORE INSERT ON class_sessions
WHEN EXISTS (
    SELECT 1 FROM class_sessions
    WHERE id != NEW.id
      AND day_of_week = NEW.day_of_week
      AND start_time < NEW.end_time
      AND end_time > NEW.start_time
)
BEGIN
    SELECT RAISE(ABORT, 'La clase se solapa con otra existente en ese horario');
END;

-- ============================================================================
-- TABLA 3: exams (Exámenes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS exams (
    id              TEXT PRIMARY KEY,                              -- UUID v4
    subject_id      TEXT NOT NULL,                                 -- FK → subjects.id
    date            TEXT NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'), -- YYYY-MM-DD
    time            TEXT NOT NULL CHECK (time GLOB '[0-2][0-9]:[0-5][0-9]'),                      -- HH:mm
    room            TEXT NOT NULL DEFAULT '',                      -- Aula del examen
    priority        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes           TEXT NOT NULL DEFAULT '',                      -- Notas / temas a evaluar
    reminder_sent_24h INTEGER NOT NULL DEFAULT 0,                 -- Flag: aviso 24h enviado
    reminder_sent_48h INTEGER NOT NULL DEFAULT 0,                 -- Flag: aviso 48h enviado
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Índices para consultas de exámenes próximos
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_priority ON exams(priority);
CREATE INDEX IF NOT EXISTS idx_exams_date_priority ON exams(date, priority);

-- ============================================================================
-- TABLA 4: exam_topics (Temas de cada examen)
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_topics (
    id              TEXT PRIMARY KEY,                              -- UUID v4
    exam_id         TEXT NOT NULL,                                 -- FK → exams.id
    name            TEXT NOT NULL,                                 -- Nombre del tema
    completed       INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)), -- 0=pendiente, 1=repasado
    sort_order      INTEGER NOT NULL DEFAULT 0,                    -- Orden de visualización
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Índices para el modo estudio
CREATE INDEX IF NOT EXISTS idx_exam_topics_exam ON exam_topics(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_topics_completed ON exam_topics(exam_id, completed);

-- ============================================================================
-- TABLA 5: settings (Configuración de la aplicación)
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Configuración por defecto
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('dark_mode', 'false'),
    ('notifications_enabled', 'true'),
    ('reminder_class_minutes', '15'),
    ('reminder_exam_hours', '24'),
    ('reminder_exam_urgent_hours', '48'),
    ('app_version', '1.0.0');

-- ============================================================================
-- TABLA 6: notification_log (Registro de notificaciones enviadas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type     TEXT NOT NULL CHECK (entity_type IN ('class', 'exam')),
    entity_id       TEXT NOT NULL,
    notification_type TEXT NOT NULL,                               -- 'class_15min', 'exam_24h', 'exam_48h'
    sent_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(entity_type, entity_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_notification_log_entity ON notification_log(entity_type, entity_id);

-- ============================================================================
-- VISTAS (Views) para consultas frecuentes del Dashboard
-- ============================================================================

-- Vista: Clases del día actual (basado en el día de la semana)
-- Uso: SELECT * FROM vw_today_classes WHERE day_of_week = strftime('%w', 'now', '-1 day');
-- Nota: strftime('%w') devuelve 0=domingo, 1=lunes... hay que ajustar
CREATE VIEW IF NOT EXISTS vw_today_classes AS
SELECT
    cs.id,
    cs.day_of_week,
    cs.start_time,
    cs.end_time,
    cs.room,
    s.id AS subject_id,
    s.name AS subject_name,
    s.color AS subject_color,
    s.professor AS subject_professor
FROM class_sessions cs
INNER JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.day_of_week, cs.start_time;

-- Vista: Próximos exámenes (próximos 14 días)
CREATE VIEW IF NOT EXISTS vw_upcoming_exams AS
SELECT
    e.id,
    e.date,
    e.time,
    e.room,
    e.priority,
    e.notes,
    s.id AS subject_id,
    s.name AS subject_name,
    s.color AS subject_color,
    s.professor AS subject_professor,
    CAST(julianday(e.date || ' ' || e.time) - julianday('now') AS INTEGER) AS days_left,
    (SELECT COUNT(*) FROM exam_topics et WHERE et.exam_id = e.id) AS total_topics,
    (SELECT COUNT(*) FROM exam_topics et WHERE et.exam_id = e.id AND et.completed = 1) AS completed_topics
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.date >= date('now')
  AND e.date <= date('now', '+14 days')
ORDER BY e.date, e.time;

-- Vista: Progreso de estudio por examen
CREATE VIEW IF NOT EXISTS vw_exam_progress AS
SELECT
    e.id AS exam_id,
    e.subject_id,
    s.name AS subject_name,
    e.date,
    e.time,
    e.priority,
    COUNT(et.id) AS total_topics,
    SUM(CASE WHEN et.completed = 1 THEN 1 ELSE 0 END) AS completed_topics,
    CASE
        WHEN COUNT(et.id) = 0 THEN 0
        ELSE ROUND(100.0 * SUM(CASE WHEN et.completed = 1 THEN 1 ELSE 0 END) / COUNT(et.id), 1)
    END AS progress_percentage
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
LEFT JOIN exam_topics et ON et.exam_id = e.id
GROUP BY e.id;

-- ============================================================================
-- TRIGGERS: Actualización automática de updated_at
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS trg_subjects_updated_at
AFTER UPDATE ON subjects
FOR EACH ROW
BEGIN
    UPDATE subjects
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_class_sessions_updated_at
AFTER UPDATE ON class_sessions
FOR EACH ROW
BEGIN
    UPDATE class_sessions
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_exams_updated_at
AFTER UPDATE ON exams
FOR EACH ROW
BEGIN
    UPDATE exams
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_exam_topics_updated_at
AFTER UPDATE ON exam_topics
FOR EACH ROW
BEGIN
    UPDATE exam_topics
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

-- ============================================================================
-- DATOS DE EJEMPLO (Opcional - para pruebas)
-- ============================================================================

-- Asignaturas de ejemplo
INSERT OR IGNORE INTO subjects (id, name, color, professor) VALUES
    ('sub-001', 'Matemáticas',       '#3B82F6', 'Dr. García López'),
    ('sub-002', 'Lengua y Literatura', '#EF4444', 'Prof. Martínez Ruiz'),
    ('sub-003', 'Historia',          '#10B981', 'Dra. Fernández Gil'),
    ('sub-004', 'Física',            '#F59E0B', 'Dr. Rodríguez Sanz'),
    ('sub-005', 'Inglés',            '#8B5CF6', 'Ms. Johnson Smith'),
    ('sub-006', 'Biología',          '#EC4899', 'Dra. López Martín');

-- Clases de ejemplo (horario semanal)
INSERT OR IGNORE INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room) VALUES
    ('cls-001', 'sub-001', 0, '08:00', '09:30', 'Aula 101'),  -- Lunes Matemáticas
    ('cls-002', 'sub-002', 0, '09:45', '11:15', 'Aula 205'),  -- Lunes Lengua
    ('cls-003', 'sub-003', 0, '11:30', '13:00', 'Aula 302'),  -- Lunes Historia
    ('cls-004', 'sub-004', 1, '08:00', '09:30', 'Lab. Física'),-- Martes Física
    ('cls-005', 'sub-001', 1, '09:45', '11:15', 'Aula 101'),  -- Martes Matemáticas
    ('cls-006', 'sub-005', 2, '08:00', '09:30', 'Aula 108'),  -- Miércoles Inglés
    ('cls-007', 'sub-006', 2, '09:45', '11:15', 'Lab. Bio'),  -- Miércoles Biología
    ('cls-008', 'sub-002', 3, '08:00', '09:30', 'Aula 205'),  -- Jueves Lengua
    ('cls-009', 'sub-003', 3, '09:45', '11:15', 'Aula 302'),  -- Jueves Historia
    ('cls-010', 'sub-004', 4, '08:00', '09:30', 'Lab. Física'),-- Viernes Física
    ('cls-011', 'sub-005', 4, '09:45', '11:15', 'Aula 108');  -- Viernes Inglés

-- Exámenes de ejemplo
INSERT OR IGNORE INTO exams (id, subject_id, date, time, room, priority, notes) VALUES
    ('exam-001', 'sub-001', date('now', '+3 days'),  '09:00', 'Aula 101', 'high',   'Ecuaciones de segundo grado y sistemas lineales'),
    ('exam-002', 'sub-002', date('now', '+7 days'),  '10:00', 'Aula 205', 'medium', 'Análisis de "La Celestina" - Actos I a V'),
    ('exam-003', 'sub-004', date('now', '+1 day'),   '08:30', 'Lab. Física', 'urgent', 'Leyes de Newton y cinemática'),
    ('exam-004', 'sub-005', date('now', '+10 days'), '11:00', 'Aula 108', 'low',    'Reading comprehension + grammar tenses'),
    ('exam-005', 'sub-006', date('now', '+14 days'), '09:30', 'Lab. Bio', 'medium', 'Genética mendeliana y ADN');

-- Temas de ejemplo para los exámenes
INSERT OR IGNORE INTO exam_topics (id, exam_id, name, completed, sort_order) VALUES
    -- Examen de Matemáticas
    ('topic-001', 'exam-001', 'Ecuaciones de 2º grado - fórmula general',     1, 1),
    ('topic-002', 'exam-001', 'Factorización de polinomios',                  1, 2),
    ('topic-003', 'exam-001', 'Sistemas de ecuaciones 2x2',                   0, 3),
    ('topic-004', 'exam-001', 'Problemas aplicados',                          0, 4),

    -- Examen de Física (urgente)
    ('topic-005', 'exam-003', 'Primera Ley de Newton (Inercia)',              1, 1),
    ('topic-006', 'exam-003', 'Segunda Ley de Newton (F=ma)',                 0, 2),
    ('topic-007', 'exam-003', 'Tercera Ley de Newton (Acción-Reacción)',      0, 3),
    ('topic-008', 'exam-003', 'MRU y MRUA - fórmulas',                        0, 4),
    ('topic-009', 'exam-003', 'Caída libre',                                  0, 5),

    -- Examen de Lengua
    ('topic-010', 'exam-002', 'Contexto histórico de La Celestina',           0, 1),
    ('topic-011', 'exam-002', 'Personajes principales y secundarios',         0, 2),
    ('topic-012', 'exam-002', 'Temas: amor, codicia, muerte',                 0, 3),
    ('topic-013', 'exam-002', 'Estructura y género tragicomedia',             0, 4);

-- ============================================================================
-- CONSULTAS ÚTILES DE EJEMPLO
-- ============================================================================

-- 1. Obtener clases del día actual (ejemplo para un miércoles = 2)
-- SELECT * FROM vw_today_classes WHERE day_of_week = 2;

-- 2. Obtener exámenes próximos con progreso de estudio
-- SELECT * FROM vw_upcoming_exams;

-- 3. Obtener progreso completo de un examen específico
-- SELECT * FROM vw_exam_progress WHERE exam_id = 'exam-001';

-- 4. Marcar un tema como completado
-- UPDATE exam_topics SET completed = 1 WHERE id = 'topic-003';

-- 5. Contar clases por asignatura en la semana
-- SELECT s.name, COUNT(cs.id) AS total_clases
-- FROM subjects s
-- LEFT JOIN class_sessions cs ON cs.subject_id = s.id
-- GROUP BY s.id
-- ORDER BY total_clases DESC;

-- 6. Exámenes que necesitan atención prioritaria (próximos 3 días)
-- SELECT e.*, s.name, s.color
-- FROM exams e
-- JOIN subjects s ON s.id = e.subject_id
-- WHERE e.date BETWEEN date('now') AND date('now', '+3 days')
-- ORDER BY e.priority DESC, e.date ASC;

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================

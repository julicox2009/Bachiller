-- ============================================================================
-- BachillerManager - Consultas CRUD comunes
-- ============================================================================
-- Este archivo contiene las consultas más utilizadas por la aplicación
-- para operaciones CRUD sobre la base de datos.
-- ============================================================================

-- ============================================================================
-- ASIGNATURAS (subjects)
-- ============================================================================

-- Crear asignatura
INSERT INTO subjects (id, name, color, professor)
VALUES (?, ?, ?, ?);

-- Listar todas las asignaturas
SELECT id, name, color, professor, created_at
FROM subjects
ORDER BY name ASC;

-- Obtener una asignatura por ID
SELECT * FROM subjects WHERE id = ?;

-- Actualizar asignatura
UPDATE subjects
SET name = ?, color = ?, professor = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Eliminar asignatura (elimina en cascada sus clases y exámenes)
DELETE FROM subjects WHERE id = ?;

-- ============================================================================
-- CLASES (class_sessions)
-- ============================================================================

-- Crear clase
INSERT INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room)
VALUES (?, ?, ?, ?, ?, ?);

-- Obtener clases de un día específico (0=Lun, 4=Vie)
SELECT cs.*, s.name AS subject_name, s.color AS subject_color, s.professor
FROM class_sessions cs
INNER JOIN subjects s ON cs.subject_id = s.id
WHERE cs.day_of_week = ?
ORDER BY cs.start_time ASC;

-- Obtener todas las clases de una asignatura
SELECT cs.*, s.name AS subject_name, s.color AS subject_color
FROM class_sessions cs
INNER JOIN subjects s ON cs.subject_id = s.id
WHERE cs.subject_id = ?
ORDER BY cs.day_of_week, cs.start_time;

-- Verificar si hay solapamiento antes de insertar
SELECT COUNT(*) AS conflicts
FROM class_sessions
WHERE day_of_week = ?
  AND start_time < ?  -- NEW.end_time
  AND end_time > ?;   -- NEW.start_time

-- Actualizar clase
UPDATE class_sessions
SET subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Eliminar clase
DELETE FROM class_sessions WHERE id = ?;

-- Obtener horario completo de la semana
SELECT cs.*, s.name AS subject_name, s.color AS subject_color, s.professor
FROM class_sessions cs
INNER JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.day_of_week, cs.start_time;

-- ============================================================================
-- EXÁMENES (exams)
-- ============================================================================

-- Crear examen
INSERT INTO exams (id, subject_id, date, time, room, priority, notes)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Obtener exámenes próximos (próximos 14 días)
SELECT e.*, s.name AS subject_name, s.color AS subject_color,
       CAST(julianday(e.date || ' ' || e.time) - julianday('now') AS INTEGER) AS days_left
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.date >= date('now')
  AND e.date <= date('now', '+14 days')
ORDER BY e.date ASC, e.time ASC;

-- Obtener examen por ID con progreso
SELECT e.*, s.name AS subject_name, s.color AS subject_color,
       (SELECT COUNT(*) FROM exam_topics et WHERE et.exam_id = e.id) AS total_topics,
       (SELECT COUNT(*) FROM exam_topics et WHERE et.exam_id = e.id AND et.completed = 1) AS completed_topics
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.id = ?;

-- Actualizar examen
UPDATE exams
SET subject_id = ?, date = ?, time = ?, room = ?, priority = ?, notes = ?,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Eliminar examen (elimina en cascada sus temas)
DELETE FROM exams WHERE id = ?;

-- Marcar notificación de 24h como enviada
UPDATE exams SET reminder_sent_24h = 1 WHERE id = ?;

-- Marcar notificación de 48h como enviada
UPDATE exams SET reminder_sent_48h = 1 WHERE id = ?;

-- Obtener exámenes que necesitan notificación de 24h
SELECT e.*, s.name AS subject_name
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.reminder_sent_24h = 0
  AND julianday(e.date || ' ' || e.time) - julianday('now') BETWEEN 23 AND 25;

-- Obtener exámenes urgentes que necesitan notificación de 48h
SELECT e.*, s.name AS subject_name
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.reminder_sent_48h = 0
  AND e.priority = 'urgent'
  AND julianday(e.date || ' ' || e.time) - julianday('now') BETWEEN 47 AND 49;

-- ============================================================================
-- TEMAS DE EXAMEN (exam_topics)
-- ============================================================================

-- Crear tema
INSERT INTO exam_topics (id, exam_id, name, completed, sort_order)
VALUES (?, ?, ?, 0, ?);

-- Obtener temas de un examen ordenados
SELECT * FROM exam_topics
WHERE exam_id = ?
ORDER BY sort_order ASC, created_at ASC;

-- Alternar estado completado (toggle)
UPDATE exam_topics
SET completed = 1 - completed,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Marcar tema como completado
UPDATE exam_topics
SET completed = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Marcar tema como pendiente
UPDATE exam_topics
SET completed = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = ?;

-- Eliminar tema
DELETE FROM exam_topics WHERE id = ?;

-- Calcular progreso de un examen
SELECT
    exam_id,
    COUNT(*) AS total,
    SUM(completed) AS completed_count,
    ROUND(100.0 * SUM(completed) / COUNT(*), 1) AS percentage
FROM exam_topics
WHERE exam_id = ?
GROUP BY exam_id;

-- ============================================================================
-- DASHBOARD / ESTADÍSTICAS
-- ============================================================================

-- Contar asignaturas, clases y exámenes
SELECT
    (SELECT COUNT(*) FROM subjects) AS total_subjects,
    (SELECT COUNT(*) FROM class_sessions) AS total_classes,
    (SELECT COUNT(*) FROM exams WHERE date >= date('now')) AS total_upcoming_exams,
    (SELECT COUNT(*) FROM exams WHERE priority = 'urgent' AND date >= date('now')) AS total_urgent_exams;

-- Clases del día actual (ajustar el día según la consulta)
-- Para SQLite, strftime('%w', 'now') devuelve 0=domingo, 1=lunes, ..., 6=sábado
-- Hay que convertir: si resultado es 0 (dom) o 6 (sáb) -> no hay clases
-- Si es 1-5 -> restar 1 para obtener 0-4 (lun-vie)
SELECT cs.*, s.name AS subject_name, s.color AS subject_color, s.professor
FROM class_sessions cs
INNER JOIN subjects s ON cs.subject_id = s.id
WHERE cs.day_of_week = (CAST(strftime('%w', 'now') AS INTEGER) - 1)
ORDER BY cs.start_time ASC;

-- Exámenes más próximos con countdown
SELECT e.*, s.name AS subject_name, s.color AS subject_color,
       CAST(julianday(e.date) - julianday('now') AS INTEGER) AS days_left,
       CASE
           WHEN julianday(e.date) - julianday('now') < 1 THEN '¡Hoy!'
           WHEN julianday(e.date) - julianday('now') < 2 THEN 'Mañana'
           ELSE 'Faltan ' || CAST(julianday(e.date) - julianday('now') AS INTEGER) || ' días'
       END AS countdown_text
FROM exams e
INNER JOIN subjects s ON e.subject_id = s.id
WHERE e.date >= date('now')
ORDER BY e.date ASC, e.time ASC
LIMIT 10;

-- ============================================================================
-- EXPORTACIÓN / IMPORTACIÓN
-- ============================================================================

-- Exportar todos los datos como JSON (SQLite 3.38+)
-- SELECT json_group_array(json_object(
--     'id', id, 'name', name, 'color', color, 'professor', professor
-- )) FROM subjects;

-- Para versiones anteriores, usar GROUP_CONCAT:
-- SELECT '[' || GROUP_CONCAT(
--     '{"id":"' || id || '","name":"' || name || '","color":"' || color || '","professor":"' || professor || '"}'
-- ) || ']' FROM subjects;

-- ============================================================================
-- MANTENIMIENTO
-- ============================================================================

-- Eliminar exámenes pasados (anteriores a hoy)
DELETE FROM exams WHERE date < date('now');

-- Limpiar log de notificaciones antiguas (más de 30 días)
DELETE FROM notification_log
WHERE sent_at < datetime('now', '-30 days');

-- Optimizar base de datos
-- VACUUM;  -- Ejecutar periódicamente para reclaimar espacio

-- ============================================================================
-- FIN DE CONSULTAS
-- ============================================================================

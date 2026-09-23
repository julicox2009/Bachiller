# 📦 PARTE 4: Archivos SQLite (database.ts y useStore.ts)

---

## 📄 ARCHIVO 8: `src/services/database.ts`

```typescript
import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
const DB_NAME = 'bachiller_manager_db';

export async function initDatabase(): Promise<void> {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    const savedDb = localStorage.getItem(DB_NAME);
    
    if (savedDb) {
      const binary = atob(savedDb);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      db = new SQL.Database(bytes);
    } else {
      db = new SQL.Database();
      createTables();
    }

    console.log('✅ SQLite inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando SQLite:', error);
    throw error;
  }
}

function createTables(): void {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      professor TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS class_sessions (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      room TEXT NOT NULL,
      priority TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_topics (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      name TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )
  `);

  saveDatabase();
}

export function saveDatabase(): void {
  if (!db) return;
  
  const data = db.export();
  let binary = '';
  const bytes = new Uint8Array(data);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  localStorage.setItem(DB_NAME, base64);
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return db;
}

export function runQuery(sql: string, params: any[] = []): void {
  const db = getDatabase();
  db.run(sql, params);
  saveDatabase();
}

export function getResults(sql: string, params: any[] = []): any[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  return results;
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}
```

---

## 📄 ARCHIVO 9: `src/store/useStore.ts`

```typescript
import { create } from 'zustand';
import { Subject, ClassSession, Exam, ExamTopic } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getResults } from '../services/database';

interface StoreState {
  subjects: Subject[];
  classes: ClassSession[];
  exams: Exam[];
  darkMode: boolean;

  addSubject: (name: string, color: string, professor: string) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addClass: (cls: Omit<ClassSession, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;

  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, data: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleTopic: (examId: string, topicId: string) => void;
  addTopic: (examId: string, topicName: string) => void;
  deleteTopic: (examId: string, topicId: string) => void;

  toggleDarkMode: () => void;

  exportData: () => string;
  importData: (json: string) => boolean;

  loadFromDatabase: () => void;
}

export const useStore = create<StoreState>()((set, get) => ({
  subjects: [],
  classes: [],
  exams: [],
  darkMode: false,

  loadFromDatabase: () => {
    try {
      const subjects = getResults('SELECT * FROM subjects') as Subject[];
      const classes = getResults('SELECT * FROM class_sessions') as ClassSession[];
      const examsRaw = getResults('SELECT * FROM exams') as any[];
      
      const exams: Exam[] = examsRaw.map(exam => {
        const topics = getResults(
          'SELECT * FROM exam_topics WHERE exam_id = ?',
          [exam.id]
        ) as ExamTopic[];
        
        return {
          ...exam,
          topics: topics.map(t => ({ ...t, completed: Boolean(t.completed) }))
        };
      });

      const darkMode = localStorage.getItem('darkMode') === 'true';

      set({ subjects, classes, exams, darkMode });
      console.log('✅ Datos cargados desde SQLite');
    } catch (error) {
      console.error('❌ Error cargando datos desde SQLite:', error);
    }
  },

  addSubject: (name, color, professor) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, color, professor, now, now]
    );

    set((state) => ({
      subjects: [...state.subjects, { id, name, color, professor }],
    }));
  },

  updateSubject: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    runQuery(
      `UPDATE subjects SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
  },

  deleteSubject: (id) => {
    runQuery('DELETE FROM subjects WHERE id = ?', [id]);

    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
      classes: state.classes.filter((c) => c.subjectId !== id),
      exams: state.exams.filter((e) => e.subjectId !== id),
    }));
  },

  addClass: (cls) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, cls.subjectId, cls.dayOfWeek, cls.startTime, cls.endTime, cls.room, now, now]
    );

    set((state) => ({
      classes: [...state.classes, { ...cls, id }],
    }));
  },

  updateClass: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data).map(key => {
      const dbKey = key === 'dayOfWeek' ? 'day_of_week' : 
                    key === 'startTime' ? 'start_time' : 
                    key === 'endTime' ? 'end_time' : 
                    key === 'subjectId' ? 'subject_id' : key;
      return `${dbKey} = ?`;
    }).join(', ');
    const values = Object.values(data);
    
    runQuery(
      `UPDATE class_sessions SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    set((state) => ({
      classes: state.classes.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteClass: (id) => {
    runQuery('DELETE FROM class_sessions WHERE id = ?', [id]);

    set((state) => ({
      classes: state.classes.filter((c) => c.id !== id),
    }));
  },

  addExam: (exam) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO exams (id, subject_id, date, time, room, priority, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, exam.subjectId, exam.date, exam.time, exam.room, exam.priority, exam.notes, now, now]
    );

    exam.topics.forEach(topic => {
      const topicId = uuidv4();
      runQuery(
        'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [topicId, id, topic.name, topic.completed ? 1 : 0, now, now]
      );
    });

    set((state) => ({
      exams: [...state.exams, { ...exam, id }],
    }));
  },

  updateExam: (id, data) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data)
      .filter(key => key !== 'topics')
      .map(key => {
        const dbKey = key === 'subjectId' ? 'subject_id' : key;
        return `${dbKey} = ?`;
      }).join(', ');
    const values = Object.entries(data)
      .filter(([key]) => key !== 'topics')
      .map(([, value]) => value);
    
    if (fields) {
      runQuery(
        `UPDATE exams SET ${fields}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    }

    if (data.topics) {
      runQuery('DELETE FROM exam_topics WHERE exam_id = ?', [id]);
      data.topics.forEach(topic => {
        const topicId = topic.id || uuidv4();
        runQuery(
          'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          [topicId, id, topic.name, topic.completed ? 1 : 0, now, now]
        );
      });
    }

    set((state) => ({
      exams: state.exams.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  },

  deleteExam: (id) => {
    runQuery('DELETE FROM exams WHERE id = ?', [id]);

    set((state) => ({
      exams: state.exams.filter((e) => e.id !== id),
    }));
  },

  toggleTopic: (examId, topicId) => {
    runQuery(
      'UPDATE exam_topics SET completed = 1 - completed, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), topicId]
    );

    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId
          ? {
              ...e,
              topics: e.topics.map((t) =>
                t.id === topicId ? { ...t, completed: !t.completed } : t
              ),
            }
          : e
      ),
    }));
  },

  addTopic: (examId, topicName) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    runQuery(
      'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, examId, topicName, now, now]
    );

    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId
          ? {
              ...e,
              topics: [...e.topics, { id, name: topicName, completed: false }],
            }
          : e
      ),
    }));
  },

  deleteTopic: (examId, topicId) => {
    runQuery('DELETE FROM exam_topics WHERE id = ?', [topicId]);

    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId
          ? { ...e, topics: e.topics.filter((t) => t.id !== topicId) }
          : e
      ),
    }));
  },

  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    set((state) => ({ darkMode: newDarkMode }));
  },

  exportData: () => {
    const { subjects, classes, exams } = get();
    return JSON.stringify({ subjects, classes, exams, exportedAt: new Date().toISOString() }, null, 2);
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.subjects && data.classes && data.exams) {
        runQuery('DELETE FROM exam_topics');
        runQuery('DELETE FROM exams');
        runQuery('DELETE FROM class_sessions');
        runQuery('DELETE FROM subjects');

        const now = new Date().toISOString();
        
        data.subjects.forEach((s: any) => {
          runQuery(
            'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [s.id, s.name, s.color, s.professor, now, now]
          );
        });

        data.classes.forEach((c: any) => {
          runQuery(
            'INSERT INTO class_sessions (id, subject_id, day_of_week, start_time, end_time, room, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [c.id, c.subjectId, c.dayOfWeek, c.startTime, c.endTime, c.room, now, now]
          );
        });

        data.exams.forEach((e: any) => {
          runQuery(
            'INSERT INTO exams (id, subject_id, date, time, room, priority, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [e.id, e.subjectId, e.date, e.time, e.room, e.priority, e.notes, now, now]
          );

          e.topics.forEach((t: any) => {
            runQuery(
              'INSERT INTO exam_topics (id, exam_id, name, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
              [t.id, e.id, t.name, t.completed ? 1 : 0, now, now]
            );
          });
        });

        get().loadFromDatabase();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
```

---

**Continúa en PARTE 5 con los componentes...**

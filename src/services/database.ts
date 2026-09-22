import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
const DB_NAME = 'bachiller_manager_db';

// Inicializar SQLite
export async function initDatabase(): Promise<void> {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Intentar cargar base de datos existente desde localStorage
    const savedDb = localStorage.getItem(DB_NAME);
    
    if (savedDb) {
      const buf = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
      db = new SQL.Database(buf);
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

// Crear tablas
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

  // NUEVA TABLA: assignments (trabajos/tareas)
  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL,
      due_time TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'homework',
      priority TEXT NOT NULL DEFAULT 'medium',
      completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // NUEVA TABLA: assignment_steps (pasos de cada trabajo)
  db.run(`
    CREATE TABLE IF NOT EXISTS assignment_steps (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      name TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
    )
  `);

  saveDatabase();
}

// Guardar base de datos en localStorage
export function saveDatabase(): void {
  if (!db) return;
  
  const data = db.export();
  // Convertir Uint8Array a base64 sin usar Buffer
  let binary = '';
  const bytes = new Uint8Array(data);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  localStorage.setItem(DB_NAME, base64);
}

// Obtener instancia de base de datos
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return db;
}

// Ejecutar consulta
export function runQuery(sql: string, params: any[] = []): void {
  const db = getDatabase();
  db.run(sql, params);
  saveDatabase();
}

// Obtener resultados
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

// Cerrar base de datos
export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

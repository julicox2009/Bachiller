-- ============================================================================
-- BachillerManager - Guía de Implementación Multiplataforma
-- ============================================================================
-- Este archivo muestra cómo integrar el esquema SQL en diferentes plataformas
-- ============================================================================

-- ============================================================================
-- 1. FLUTTER (Dart) con sqflite o drift
-- ============================================================================

/*
// pubspec.yaml
dependencies:
  sqflite: ^2.3.0
  path: ^1.8.3
  path_provider: ^2.1.1

// lib/database/database_helper.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('bachiller_manager.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // Ejecutar el schema.sql completo
    await db.execute('''
      CREATE TABLE subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT '#3B82F6',
        professor TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    ''');

    await db.execute('''
      CREATE TABLE class_sessions (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 4),
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        room TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        CHECK (end_time > start_time),
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE exams (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        room TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium'
          CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        notes TEXT NOT NULL DEFAULT '',
        reminder_sent_24h INTEGER NOT NULL DEFAULT 0,
        reminder_sent_48h INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE exam_topics (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        name TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      )
    ''');

    // Crear índices
    await db.execute('CREATE INDEX idx_subjects_name ON subjects(name)');
    await db.execute('CREATE INDEX idx_class_sessions_day ON class_sessions(day_of_week)');
    await db.execute('CREATE INDEX idx_exams_date ON exams(date)');
    await db.execute('CREATE INDEX idx_exam_topics_exam ON exam_topics(exam_id)');
  }

  // Métodos CRUD para Subject
  Future<int> insertSubject(Subject subject) async {
    final db = await database;
    return await db.insert('subjects', subject.toMap());
  }

  Future<List<Subject>> getAllSubjects() async {
    final db = await database;
    final result = await db.query('subjects', orderBy: 'name ASC');
    return result.map((map) => Subject.fromMap(map)).toList();
  }

  Future<int> updateSubject(Subject subject) async {
    final db = await database;
    return await db.update(
      'subjects',
      subject.toMap(),
      where: 'id = ?',
      whereArgs: [subject.id],
    );
  }

  Future<int> deleteSubject(String id) async {
    final db = await database;
    return await db.delete('subjects', where: 'id = ?', whereArgs: [id]);
  }

  // Métodos similares para ClassSession, Exam, ExamTopic...
}

// Modelo Subject
class Subject {
  final String id;
  final String name;
  final String color;
  final String professor;
  final DateTime createdAt;
  final DateTime updatedAt;

  Subject({
    required this.id,
    required this.name,
    required this.color,
    required this.professor,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'color': color,
        'professor': professor,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
      };

  factory Subject.fromMap(Map<String, dynamic> map) => Subject(
        id: map['id'],
        name: map['name'],
        color: map['color'],
        professor: map['professor'],
        createdAt: DateTime.parse(map['created_at']),
        updatedAt: DateTime.parse(map['updated_at']),
      );
}
*/

-- ============================================================================
-- 2. REACT NATIVE con react-native-sqlite-storage
-- ============================================================================

/*
// npm install react-native-sqlite-storage
// ios: cd ios && pod install

// src/database/DatabaseService.ts
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabase({
      name: 'bachiller_manager.db',
      location: 'default',
    });

    await this.createTables();
  }

  private async createTables() {
    await this.db!.executeSql(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT '#3B82F6',
        professor TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // ... resto de tablas
  }

  async getSubjects(): Promise<Subject[]> {
    const [results] = await this.db!.executeSql(
      'SELECT * FROM subjects ORDER BY name ASC'
    );

    const subjects: Subject[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      subjects.push(results.rows.item(i));
    }
    return subjects;
  }

  async insertSubject(subject: Subject) {
    await this.db!.executeSql(
      'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [subject.id, subject.name, subject.color, subject.professor, new Date().toISOString(), new Date().toISOString()]
    );
  }
}

export const dbService = new DatabaseService();
*/

-- ============================================================================
-- 3. ELECTRON (Desktop) con better-sqlite3
-- ============================================================================

/*
// npm install better-sqlite3
// npm install --save-dev @types/better-sqlite3

// src/main/database.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'bachiller_manager.db');
    this.db = new Database(dbPath);

    // Configurar PRAGMAs
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.createTables();
  }

  private createTables() {
    // Leer y ejecutar schema.sql
    const fs = require('fs');
    const schema = fs.readFileSync('./database/schema.sql', 'utf-8');
    this.db.exec(schema);
  }

  // Métodos CRUD con transacciones
  getAllSubjects(): Subject[] {
    return this.db.prepare('SELECT * FROM subjects ORDER BY name ASC').all();
  }

  insertSubject(subject: Subject) {
    const stmt = this.db.prepare(`
      INSERT INTO subjects (id, name, color, professor, created_at, updated_at)
      VALUES (@id, @name, @color, @professor, @created_at, @updated_at)
    `);

    stmt.run({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      professor: subject.professor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Transacción para operaciones múltiples
  bulkInsertSubjects(subjects: Subject[]) {
    const insertMany = this.db.transaction((subjects) => {
      for (const subject of subjects) {
        this.insertSubject(subject);
      }
    });

    insertMany(subjects);
  }

  close() {
    this.db.close();
  }
}

export const dbManager = new DatabaseManager();
*/

-- ============================================================================
-- 4. MIGRACIONES (Evolución del esquema)
-- ============================================================================

/*
// Para manejar versiones de la base de datos, crear tabla de migraciones:

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    description TEXT NOT NULL
);

-- Ejemplo de migración v2: Agregar campo 'semester' a subjects
-- INSERT INTO schema_migrations (version, description) VALUES (2, 'Add semester to subjects');
-- ALTER TABLE subjects ADD COLUMN semester TEXT DEFAULT '';

-- Función para aplicar migraciones pendientes:
-- SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;
-- Si la versión actual < última migración, aplicar las pendientes
*/

-- ============================================================================
-- 5. BACKUP Y RESTAURACIÓN
-- ============================================================================

/*
// Exportar a JSON (para migrar entre dispositivos)
async function exportToJSON(db) {
  const data = {
    subjects: await db.getAll('SELECT * FROM subjects'),
    classes: await db.getAll('SELECT * FROM class_sessions'),
    exams: await db.getAll('SELECT * FROM exams'),
    exam_topics: await db.getAll('SELECT * FROM exam_topics'),
    exported_at: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

// Importar desde JSON
async function importFromJSON(db, jsonString) {
  const data = JSON.parse(jsonString);

  // Usar transacción para atomicidad
  await db.transaction(async () => {
    // Limpiar datos existentes
    await db.run('DELETE FROM exam_topics');
    await db.run('DELETE FROM exams');
    await db.run('DELETE FROM class_sessions');
    await db.run('DELETE FROM subjects');

    // Insertar nuevos datos
    for (const subject of data.subjects) {
      await db.run(
        'INSERT INTO subjects (id, name, color, professor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [subject.id, subject.name, subject.color, subject.professor, subject.created_at, subject.updated_at]
      );
    }

    // ... repetir para classes, exams, exam_topics
  });
}
*/

-- ============================================================================
-- FIN DE LA GUÍA
-- ============================================================================

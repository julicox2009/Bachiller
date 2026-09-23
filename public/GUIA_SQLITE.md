# 🗄️ GUÍA: Cómo levantar SQLite con BachillerManager

## 📊 OPCIÓN A: SQLite en el navegador (YA IMPLEMENTADO ✅)

**Estado:** Ya funciona en tu app actual
**Ventajas:** No necesita servidor, 100% offline
**Desventajas:** Los datos solo están en ese navegador/dispositivo

### Verificar que funciona:
1. Abre la app
2. Verás "Inicializando BachillerManager..."
3. En consola (F12) verás: `✅ SQLite inicializado correctamente`

### ¿Dónde se guardan los datos?
- En `localStorage` del navegador
- Clave: `bachiller_manager_db`
- Si borras caché del navegador, pierdes los datos
- Usa "Exportar datos" en Ajustes para hacer backup

---

## 📊 OPCIÓN B: SQLite en servidor (para sincronizar dispositivos)

Si quieres acceder desde PC, móvil y NAS con los mismos datos, necesitas un backend.

### Opción B1: Node.js + Express + better-sqlite3

```bash
# Crear carpeta del servidor
mkdir bachiller-server
cd bachiller-server
npm init -y
npm install express better-sqlite3 cors
```

**server.js:**
```javascript
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a SQLite
const db = new Database('bachiller_manager.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Crear tablas (usar schema.sql)
const fs = require('fs');
const schema = fs.readFileSync('./schema.sql', 'utf-8');
db.exec(schema);

// API Endpoints
app.get('/api/subjects', (req, res) => {
  res.json(db.prepare('SELECT * FROM subjects').all());
});

app.post('/api/subjects', (req, res) => {
  const { id, name, color, professor } = req.body;
  db.prepare('INSERT INTO subjects VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))')
    .run(id, name, color, professor);
  res.json({ success: true });
});

// ... más endpoints para classes, exams, assignments

app.listen(3001, () => {
  console.log('🚀 Servidor en http://localhost:3001');
});
```

**Ejecutar:**
```bash
node server.js
```

### Opción B2: Python + FastAPI + sqlite3

```bash
pip install fastapi uvicorn
```

**main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

db = sqlite3.connect('bachiller_manager.db', check_same_thread=False)

@app.get("/api/subjects")
def get_subjects():
    cursor = db.execute("SELECT * FROM subjects")
    return [dict(row) for row in cursor.fetchall()]

# ... más endpoints
```

**Ejecutar:**
```bash
uvicorn main:app --reload --port 3001
```

---

## 📊 OPCIÓN C: Sincronización P2P (sin servidor)

Usa **GunDB** o **PeerJS** para sincronizar entre dispositivos sin servidor central.

```bash
npm install gun
```

---

## 🎯 MI RECOMENDACIÓN

**Para uso personal en un dispositivo:**
✅ Usa la opción A (ya implementada)

**Para usar en varios dispositivos:**
✅ Usa la opción B1 (Node.js) en tu NAS QNAP

**Para compartir con compañeros:**
✅ Publica en Vercel/Netlify + backend en Railway/Render

---

## 🔧 Modificar la app para usar API en vez de localStorage

Si decides usar un servidor, modifica `src/services/database.ts`:

```typescript
const API_URL = 'http://tu-nas-ip:3001/api';

export async function initDatabase(): Promise<void> {
  // Ya no necesita sql.js, usa fetch a la API
  console.log('✅ Conectado al servidor');
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await fetch(`${API_URL}/subjects`);
  return response.json();
}

export async function addSubject(subject: Subject): Promise<void> {
  await fetch(`${API_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject),
  });
}
```

---

## 📋 Resumen

| Opción | Dónde corre SQLite | Sincronización | Complejidad |
|--------|-------------------|----------------|-------------|
| A (actual) | Navegador | ❌ No | ✅ Ya implementado |
| B1 | Servidor Node.js | ✅ Sí | 🟡 Media |
| B2 | Servidor Python | ✅ Sí | 🟡 Media |
| C | P2P | ✅ Sí | 🔴 Alta |

**Tu app actual YA usa SQLite** (en el navegador). Solo necesitas un backend si quieres sincronizar entre dispositivos.

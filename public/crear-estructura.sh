#!/bin/bash

# Script para crear la estructura de carpetas de BachillerManager
# Ejecutar: bash crear-estructura.sh

echo "🚀 Creando estructura de carpetas para BachillerManager..."

# Crear carpetas principales
mkdir -p src/types
mkdir -p src/store
mkdir -p src/components
mkdir -p src/pages
mkdir -p public/database

echo "✅ Carpetas creadas"

# Crear archivos vacíos (para que copies el contenido)
touch index.html
touch tsconfig.json
touch vite.config.js
touch .gitignore
touch README.md

# Crear archivos de src
touch src/App.tsx
touch src/main.tsx
touch src/index.css
touch src/types/index.ts
touch src/store/useStore.ts
touch src/components/Layout.tsx
touch src/components/WelcomeScreen.tsx
touch src/pages/Dashboard.tsx
touch src/pages/Schedule.tsx
touch src/pages/Exams.tsx
touch src/pages/Subjects.tsx
touch src/pages/Settings.tsx

# Crear archivos de public
touch public/manifest.json
touch public/sw.js

echo "✅ Archivos creados"

# Inicializar package.json
echo "📦 Inicializando package.json..."
npm init -y

echo ""
echo "✅ ¡Estructura creada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia el contenido de cada archivo desde la guía"
echo "2. Ejecuta: npm install"
echo "3. Ejecuta: npm run dev"
echo ""
echo "📖 Consulta: public/GUIA_DESCARGA_COMPLETA.md"

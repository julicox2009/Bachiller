# 📦 Guía Completa de Archivos - BachillerManager

## 🎯 Archivos ESENCIALES (Obligatorios para que funcione)

Estos archivos son **imprescindibles**. Sin ellos, la app no funcionará.

### 📁 Estructura de carpetas
```
bachiller-manager/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── store/
│   │   └── useStore.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── WelcomeScreen.tsx
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Schedule.tsx
│       ├── Exams.tsx
│       ├── Subjects.tsx
│       └── Settings.tsx
```

### 📋 Lista de archivos (17 archivos esenciales)

#### Raíz del proyecto (4 archivos)
1. **index.html** - Página principal HTML
2. **package.json** - Dependencias y scripts (se genera con `npm init`)
3. **tsconfig.json** - Configuración de TypeScript
4. **vite.config.js** - Configuración de Vite

#### Carpeta src/ (13 archivos)
5. **src/App.tsx** - Componente principal
6. **src/main.tsx** - Punto de entrada
7. **src/index.css** - Estilos globales
8. **src/types/index.ts** - Tipos TypeScript
9. **src/store/useStore.ts** - Estado global (Zustand)
10. **src/components/Layout.tsx** - Layout con sidebar
11. **src/components/WelcomeScreen.tsx** - Pantalla de bienvenida
12. **src/pages/Dashboard.tsx** - Vista principal
13. **src/pages/Schedule.tsx** - Horario semanal
14. **src/pages/Exams.tsx** - Gestión de exámenes
15. **src/pages/Subjects.tsx** - Gestión de asignaturas
16. **src/pages/Settings.tsx** - Configuración

---

## 🔧 Archivos de CONFIGURACIÓN (Recomendados)

Estos archivos mejoran la experiencia pero no son estrictamente necesarios.

### 📋 Lista (2 archivos)
17. **.gitignore** - Ignorar archivos en Git
18. **README.md** - Documentación del proyecto

---

## 📱 Archivos para PWA/Android (Opcionales)

Si quieres instalar la app en Android como PWA.

### 📋 Lista (2 archivos)
19. **public/manifest.json** - Configuración PWA
20. **public/sw.js** - Service Worker (offline)

---

## 📚 Archivos de DOCUMENTACIÓN (Opcionales)

Guías y documentación útil pero no necesaria para que funcione.

### 📋 Lista (6 archivos)
21. **public/ARCHIVOS_INDICE.md** - Índice de archivos
22. **public/ANDROID_SETUP.md** - Guía de instalación en Android
23. **public/GITHUB_SETUP.md** - Guía para subir a GitHub
24. **public/database/schema.sql** - Esquema SQL para SQLite
25. **public/database/queries.sql** - Consultas SQL
26. **public/database/implementation_guide.sql** - Guía de implementación
27. **public/database/DATABASE_SCHEMA.md** - Documentación de BD

---

## 🚀 Pasos para descargar e instalar

### Opción 1: Descargar todo (Recomendado)
Descarga los **17 archivos esenciales** + **package.json** se genera automáticamente.

### Opción 2: Descargar mínimo
Solo los **17 archivos esenciales** de la lista anterior.

### Opción 3: Descargar completo
Todos los **27 archivos** (incluyendo documentación y PWA).

---

## 📝 Instrucciones paso a paso

### 1. Crear la estructura de carpetas
```bash
mkdir bachiller-manager
cd bachiller-manager
mkdir -p src/{types,store,components,pages}
mkdir -p public/database
```

### 2. Copiar los archivos esenciales
Copia los 17 archivos de la lista "ESENCIALES" manteniendo la estructura.

### 3. Inicializar el proyecto
```bash
npm init -y
```

### 4. Instalar dependencias
```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react
npm install zustand date-fns lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

### 5. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 6. Abrir en el navegador
Ve a http://localhost:5173

---

## ✅ Checklist rápido

Antes de ejecutar, verifica que tienes:

- [ ] index.html
- [ ] package.json (generado con `npm init`)
- [ ] tsconfig.json
- [ ] vite.config.js
- [ ] src/App.tsx
- [ ] src/main.tsx
- [ ] src/index.css
- [ ] src/types/index.ts
- [ ] src/store/useStore.ts
- [ ] src/components/Layout.tsx
- [ ] src/components/WelcomeScreen.tsx
- [ ] src/pages/Dashboard.tsx
- [ ] src/pages/Schedule.tsx
- [ ] src/pages/Exams.tsx
- [ ] src/pages/Subjects.tsx
- [ ] src/pages/Settings.tsx

---

## 🎯 Resumen

| Categoría | Cantidad | Necesario |
|-----------|----------|-----------|
| Esenciales | 17 | ✅ Sí |
| Configuración | 2 | 🔶 Recomendado |
| PWA/Android | 2 | ❌ Opcional |
| Documentación | 6 | ❌ Opcional |
| **TOTAL** | **27** | **17 mínimos** |

---

## 💡 Consejo

**Para empezar rápido:** Descarga solo los **17 archivos esenciales** y sigue los pasos 1-6.

**Para tener todo completo:** Descarga los **27 archivos** para tener documentación, PWA y guías.

---

¿Necesitas ayuda con algún archivo específico? ¡Pregúntame!

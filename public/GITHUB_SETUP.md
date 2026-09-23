# 📋 Guía para subir BachillerManager a GitHub

## Pasos para subir el proyecto a tu cuenta de GitHub

### 1. Crear cuenta en GitHub (si no tienes)
Ve a https://github.com y regístrate si aún no tienes cuenta.

### 2. Instalar Git en tu computadora

**Windows:**
- Descarga desde: https://git-scm.com/download/win
- Instala con las opciones por defecto

**macOS:**
```bash
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install git
```

### 3. Configurar Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 4. Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre del repositorio: `bachiller-manager`
3. Descripción: "Asistente de gestión académica de Jesús"
4. Visibilidad: Público o Privado (tu elección)
5. **NO** marcar "Initialize with README" (ya lo tenemos)
6. Haz clic en "Create repository"

### 5. Subir el código desde tu computadora

Descarga los archivos del proyecto a tu PC y ejecuta en la terminal:

```bash
# Navegar a la carpeta del proyecto
cd bachiller-manager

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "🎉 Versión inicial de BachillerManager"

# Conectar con GitHub (reemplaza TU-USUARIO con tu usuario)
git remote add origin https://github.com/TU-USUARIO/bachiller-manager.git

# Subir el código
git branch -M main
git push -u origin main
```

### 6. Actualizaciones futuras
```bash
# Después de hacer cambios
git add .
git commit -m "📝 Descripción de los cambios"
git push
```

## 📦 Alternativa: Descargar como ZIP

Si prefieres, puedes descargar todos los archivos como ZIP y luego subirlos manualmente:

1. Descarga los archivos del proyecto
2. Descomprime en una carpeta
3. Sigue los pasos del 4 en adelante

## 🚀 Despliegue en GitHub Pages (opcional)

Si quieres que la app sea accesible públicamente:

1. Instala gh-pages:
```bash
npm install -D gh-pages
```

2. Agrega en `package.json` (sección scripts):
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. Ejecuta:
```bash
npm run deploy
```

4. En GitHub → Settings → Pages → Source: gh-pages branch

## 🔐 Autenticación en GitHub

GitHub ya no acepta contraseñas. Usa una de estas opciones:

### Opción A: GitHub CLI (recomendado)
```bash
# Instalar GitHub CLI
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Autenticar
gh auth login
```

### Opción B: Personal Access Token
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Selecciona permisos: `repo`
4. Copia el token y úsalo como contraseña cuando Git lo pida

## 📝 Estructura del repositorio

```
bachiller-manager/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.js
├── public/
│   └── database/
│       ├── schema.sql
│       ├── queries.sql
│       ├── implementation_guide.sql
│       └── DATABASE_SCHEMA.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    ├── store/
    ├── components/
    └── pages/
```

## ❓ Problemas comunes

**Error: "fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/bachiller-manager.git
```

**Error: "Updates were rejected"**
```bash
git pull origin main --rebase
git push -u origin main
```

**Error de autenticación**
- Verifica que estás usando un Personal Access Token
- O usa `gh auth login` con GitHub CLI

## 📞 ¿Necesitas ayuda?

Si tienes dudas con algún paso, puedes:
1. Consultar la documentación oficial: https://docs.github.com
2. Preguntarme cualquier duda específica

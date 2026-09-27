# 📋 Índice de Archivos - BachillerManager

Copia estos archivos en tu computadora manteniendo la estructura de carpetas.

## Estructura de carpetas
```
bachiller-manager/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.js
├── .gitignore
├── README.md
├── public/
│   ├── database/
│   │   ├── schema.sql
│   │   ├── queries.sql
│   │   ├── implementation_guide.sql
│   │   └── DATABASE_SCHEMA.md
│   ├── manifest.json
│   ├── sw.js
│   └── GITHUB_SETUP.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── store/
    │   └── useStore.ts
    ├── components/
    │   ├── Layout.tsx
    │   └── WelcomeScreen.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── Schedule.tsx
        ├── Exams.tsx
        ├── Subjects.tsx
        └── Settings.tsx
```

## Archivos principales (25 archivos en total)

### Raíz del proyecto (7 archivos)
1. `index.html`
2. `package.json`
3. `package-lock.json` (se genera con `npm install`)
4. `tsconfig.json`
5. `vite.config.js`
6. `.gitignore`
7. `README.md`

### Carpeta public/ (6 archivos)
8. `public/manifest.json`
9. `public/sw.js`
10. `public/GITHUB_SETUP.md`
11. `public/database/schema.sql`
12. `public/database/queries.sql`
13. `public/database/implementation_guide.sql`
14. `public/database/DATABASE_SCHEMA.md`

### Carpeta src/ (12 archivos)
15. `src/App.tsx`
16. `src/main.tsx`
17. `src/index.css`
18. `src/types/index.ts`
19. `src/store/useStore.ts`
20. `src/components/Layout.tsx`
21. `src/components/WelcomeScreen.tsx`
22. `src/pages/Dashboard.tsx`
23. `src/pages/Schedule.tsx`
24. `src/pages/Exams.tsx`
25. `src/pages/Subjects.tsx`
26. `src/pages/Settings.tsx`

## 🚀 Pasos rápidos para ejecutar en tu PC

```bash
# 1. Instala Node.js desde https://nodejs.org (versión LTS)

# 2. Abre terminal en la carpeta del proyecto
cd bachiller-manager

# 3. Instala dependencias
npm install

# 4. Ejecuta en modo desarrollo
npm run dev

# 5. Abre http://localhost:5173 en tu navegador
```

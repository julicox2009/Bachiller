# 🏠 GUÍA: Implementar BachillerManager en NAS QNAP TS-231B

## 📋 Especificaciones de tu NAS

**QNAP TS-231B:**
- CPU: Annapurna Labs Alpine AL-215 (ARM Cortex-A15 dual-core 1.7GHz)
- RAM: 1GB DDR3 (no ampliable)
- Arquitectura: ARM (no x86)
- Sistema: QTS (basado en Linux)

**⚠️ Limitaciones:**
- 1GB de RAM es poco para Docker
- Arquitectura ARM limita las imágenes disponibles
- Container Station puede no estar disponible en versiones antiguas de QTS

---

## 🎯 OPCIONES PARA TU NAS

### ✅ OPCIÓN 1: Web Server estático (RECOMENDADO)

La forma más sencilla y ligera. Solo sirve los archivos HTML/JS/CSS.

**Ventajas:**
- ✅ Muy ligero (no consume RAM)
- ✅ Funciona con 1GB de RAM
- ✅ SQLite funciona en el navegador
- ✅ No necesita Docker

**Pasos:**

1. **Compilar la app:**
```bash
npm run build
```

2. **Copiar la carpeta `dist/` al NAS:**
```bash
# Desde tu PC, copia la carpeta dist/ a una carpeta compartida del NAS
# Ejemplo: \\TU-NAS\web\bachiller-manager\
```

3. **Configurar Web Server en QTS:**
   - Abre QTS → Panel de Control → Aplicaciones → Web Server
   - Activa "Web Server"
   - Configura la ruta a la carpeta donde copiaste `dist/`

4. **Acceder desde cualquier dispositivo:**
```
http://TU-NAS-IP:8080/bachiller-manager/
```

5. **Instalar como PWA en Android:**
   - Abre la URL en Chrome
   - Menú ⋮ → "Añadir a pantalla principal"

---

### ✅ OPCIÓN 2: Docker con Nginx (si tienes suficiente RAM)

Si tu NAS tiene Container Station y suficiente RAM libre.

**Verificar si puedes usar Docker:**
- Abre QTS → App Center
- Busca "Container Station"
- Si está disponible y tu NAS tiene al menos 512MB libres, puedes usarlo

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  bachiller-manager:
    image: nginx:alpine
    container_name: bachiller-manager
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
    restart: unless-stopped
```

**Pasos:**

1. **Compilar la app:**
```bash
npm run build
```

2. **Crear carpeta en el NAS:**
```bash
# En una carpeta compartida del NAS, crea:
# /bachiller-manager/
#   ├── dist/          (copia aquí la carpeta dist compilada)
#   └── docker-compose.yml
```

3. **Copiar archivos al NAS:**
```bash
# Copia dist/ y docker-compose.yml al NAS
```

4. **En Container Station:**
   - Abre Container Station
   - Ve a "Applications" → "Create"
   - Selecciona "Import compose file"
   - Sube docker-compose.yml
   - Click "Create"

5. **Acceder:**
```
http://TU-NAS-IP:8080
```

---

### ✅ OPCIÓN 3: Backend completo con SQLite en servidor

Si quieres sincronizar datos entre dispositivos.

**⚠️ ADVERTENCIA:** Con 1GB de RAM, esto puede ser muy limitado.

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    image: node:18-alpine
    container_name: bachiller-backend
    working_dir: /app
    volumes:
      - ./server:/app
      - ./data:/data
    ports:
      - "3001:3001"
    command: node server.js
    restart: unless-stopped
    environment:
      - NODE_ENV=production

  frontend:
    image: nginx:alpine
    container_name: bachiller-frontend
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    restart: unless-stopped
```

**Limitaciones:**
- Node.js consume ~100-200MB de RAM
- Nginx consume ~10MB
- Total: ~200-300MB (puede ser mucho para tu NAS)

---

## 🎯 MI RECOMENDACIÓN PARA TU TS-231B

### **OPCIÓN 1: Web Server estático** (LA MEJOR)

**¿Por qué?**
- ✅ No consume RAM adicional
- ✅ SQLite funciona en el navegador de cada dispositivo
- ✅ Cada dispositivo tiene sus propios datos
- ✅ Funciona con 1GB de RAM sin problemas
- ✅ Muy rápido

**Desventaja:**
- ❌ Cada dispositivo tiene sus propios datos (no se sincronizan)
- ✅ Pero puedes usar "Exportar/Importar" para mover datos

---

## 📝 PASOS DETALLADOS: OPCIÓN 1 (Web Server)

### 1. Compilar la app en tu PC

```bash
cd bachiller-manager
npm run build
```

Esto crea la carpeta `dist/` con todos los archivos optimizados.

### 2. Copiar al NAS

**En Windows:**
```
1. Abre el Explorador de Archivos
2. En la barra de direcciones escribe: \\TU-NAS-IP
3. Autentícate con usuario/contraseña del NAS
4. Crea una carpeta: bachiller-manager
5. Copia la carpeta dist/ dentro
```

**En Mac/Linux:**
```bash
# Montar carpeta compartida del NAS
sudo mount -t cifs //TU-NAS-IP/web /mnt/nas -o username=tu-usuario

# Copiar archivos
cp -r dist/ /mnt/nas/bachiller-manager/
```

### 3. Configurar Web Server en QTS

1. Abre QTS en el navegador
2. Ve a **Panel de Control** → **Aplicaciones** → **Servicios de red y archivos**
3. Busca **Web Server** o **Qweb**
4. Activa el servicio
5. Configura:
   - Puerto: 8080 (o el que prefieras)
   - Ruta: apunta a la carpeta donde copiaste `dist/`

### 4. Acceder desde cualquier dispositivo

**Desde PC:**
```
http://192.168.1.100:8080/bachiller-manager/
```

**Desde Android:**
1. Abre Chrome
2. Ve a `http://192.168.1.100:8080/bachiller-manager/`
3. Menú ⋮ → "Añadir a pantalla principal"
4. ¡Listo! Se instala como app

---

## 🔄 Sincronizar datos entre dispositivos

Como cada dispositivo tiene su propia base de datos SQLite en el navegador, los datos NO se sincronizan automáticamente.

**Solución: Exportar/Importar**

1. **En el dispositivo origen:**
   - Abre BachillerManager
   - Ve a Ajustes → "Exportar datos"
   - Se descarga un archivo JSON

2. **Copia el archivo al otro dispositivo:**
   - Email, WhatsApp, USB, etc.

3. **En el dispositivo destino:**
   - Abre BachillerManager
   - Ve a Ajustes → "Importar datos"
   - Selecciona el archivo JSON

---

## 🐛 Solución de problemas

### "No puedo acceder desde el móvil"
- Verifica que el móvil está en la misma red WiFi
- Usa la IP del NAS (no el nombre)
- Verifica que el puerto no está bloqueado por el firewall

### "Web Server no aparece en QTS"
- Tu versión de QTS puede ser muy antigua
- Actualiza QTS a la última versión
- O usa la OPCIÓN 2 (Docker) si está disponible

### "La app va muy lenta"
- Con 1GB de RAM, evita tener muchos servicios corriendo
- Cierra otras aplicaciones en QTS
- Usa la OPCIÓN 1 (Web Server estático) que es la más ligera

### "Los datos no se guardan"
- SQLite funciona en el navegador, no en el NAS
- Si borras caché del navegador, pierdes los datos
- Haz backup regularmente con "Exportar datos"

---

## 📊 Comparación de opciones

| Opción | RAM necesaria | Sincronización | Complejidad | Recomendado |
|--------|---------------|----------------|-------------|-------------|
| 1. Web Server | ~0 MB | ❌ No | 🟢 Fácil | ✅ SÍ |
| 2. Docker Nginx | ~50 MB | ❌ No | 🟡 Media | ⚠️ Si sobra RAM |
| 3. Backend completo | ~300 MB | ✅ Sí | 🔴 Difícil | ❌ NO (poca RAM) |

---

## 🎯 RESUMEN

**Para tu QNAP TS-231B con 1GB de RAM:**

✅ **USA LA OPCIÓN 1: Web Server estático**

- Compila la app: `npm run build`
- Copia `dist/` al NAS
- Activa Web Server en QTS
- Accede desde cualquier dispositivo
- Instala como PWA en Android

**Ventajas:**
- No consume RAM del NAS
- Rápido y ligero
- SQLite funciona en cada navegador
- Fácil de mantener

**Desventajas:**
- Datos no se sincronizan entre dispositivos
- Usa Exportar/Importar para mover datos

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas con algún paso, dime:
1. ¿Qué versión de QTS tienes?
2. ¿Tienes Container Station disponible?
3. ¿Cuánta RAM libre tienes?

Y te ayudo con la mejor opción para tu caso.

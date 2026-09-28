# 🕐 Actualización del Horario Escolar

## ✅ Cambios realizados

Se ha actualizado el horario de la aplicación para que coincida con las franjas horarias de tu instituto.

### Nuevo horario:

| Franja | Hora Inicio | Hora Fin | Duración |
|--------|-------------|----------|----------|
| **1ª Clase** | 08:15 | 09:15 | 60 min |
| **2ª Clase** | 09:15 | 10:15 | 60 min |
| **3ª Clase** | 10:15 | 11:15 | 60 min |
| **Recreo** | 11:15 | 11:45 | 30 min |
| **4ª Clase** | 11:45 | 12:45 | 60 min |
| **5ª Clase** | 12:45 | 13:45 | 60 min |
| **6ª Clase** | 13:45 | 14:45 | 60 min |

**Total de clases:** 6 clases de 60 minutos cada una  
**Total de recreo:** 30 minutos  
**Jornada total:** 6 horas y 30 minutos (08:15 - 14:45)

---

## 🔧 Archivos modificados

### 1. `src/types/index.ts`
- Actualizado el array `TIME_SLOTS` con las nuevas horas de inicio:
  ```typescript
  export const TIME_SLOTS = [
    '08:15', '09:15', '10:15', '11:15', '11:45', '12:45', '13:45'
  ];
  ```

### 2. `src/pages/Schedule.tsx`
- Actualizados los valores por defecto del formulario:
  - `startTime`: '08:15' (antes '08:00')
  - `endTime`: '09:15' (antes '09:00')
- Actualizado el fallback de hora de fin: '09:15'
- Actualizado el botón "Agregar clase" en vista móvil: '08:15'

---

## 📋 Cómo usar el nuevo horario

### Agregar una clase:

1. Ve a **Horario** en el menú principal
2. Haz clic en el botón **"+ Agregar Clase"** o en cualquier celda vacía del horario
3. Selecciona:
   - **Asignatura**: La materia que quieres agregar
   - **Día**: Lunes a Viernes
   - **Hora de inicio**: 08:15, 09:15, 10:15, 11:15, 11:45, 12:45, o 13:45
   - **Hora de fin**: La siguiente franja horaria
   - **Aula**: El número de aula

### Ejemplo: Agregar Matemáticas el Lunes

1. Clic en "Agregar Clase"
2. Asignatura: Matemáticas
3. Día: Lunes
4. Hora inicio: 08:15
5. Hora fin: 09:15
6. Aula: 101
7. Clic en "Agregar Clase"

### Vista del horario:

- **Vista escritorio**: Grid semanal con todas las franjas horarias
- **Vista móvil**: Vista por días con navegación entre días

---

## 🎯 Características del horario

### Franjas horarias disponibles:
- ✅ 08:15 - 09:15 (1ª clase)
- ✅ 09:15 - 10:15 (2ª clase)
- ✅ 10:15 - 11:15 (3ª clase)
- ✅ 11:15 - 11:45 (Recreo - no se puede asignar clase)
- ✅ 11:45 - 12:45 (4ª clase)
- ✅ 12:45 - 13:45 (5ª clase)
- ✅ 13:45 - 14:45 (6ª clase)

### Funcionalidades:
- ✅ **Vista semanal completa** en escritorio
- ✅ **Vista por días** en móvil
- ✅ **Colores por asignatura** para identificación visual
- ✅ **Edición rápida** haciendo clic en una clase
- ✅ **Eliminación con confirmación** para evitar errores
- ✅ **Sincronización con Supabase** para multi-dispositivo

---

## 💡 Consejos de uso

### Para un horario completo:
1. Empieza por las asignaturas más importantes
2. Usa colores diferentes para cada asignatura
3. Agrega todas las clases de la semana
4. Revisa el horario completo antes de empezar el curso

### Para el recreo:
- El recreo (11:15 - 11:45) aparece en el horario pero no se puede asignar clase
- Es solo informativo para que sepas cuándo es el descanso

### Para editar una clase:
1. Haz clic en la clase que quieres editar
2. Modifica los campos necesarios
3. Haz clic en "Guardar Cambios"

### Para eliminar una clase:
1. Haz clic en la clase
2. Haz clic en "Eliminar"
3. Confirma la eliminación

---

## 🔄 Sincronización

El horario se sincroniza automáticamente con Supabase:
- ✅ Los cambios se guardan en la nube
- ✅ Se sincronizan entre PC y móvil
- ✅ Si no hay conexión, se guardan localmente y se sincronizan después

---

## 🐛 Solución de problemas

### "No veo las franjas horarias correctas"
- Recarga la página (Ctrl+F5 o Cmd+Shift+R)
- Verifica que estás usando la última versión de la app

### "No puedo agregar una clase"
- Verifica que hayas creado al menos una asignatura primero
- Verifica que hayas seleccionado una hora de inicio y fin válidas

### "El horario no se sincroniza"
- Ve a **Ajustes** → **Diagnóstico de Supabase**
- Haz clic en **Ejecutar** para verificar la conexión
- Si hay error, revisa la configuración de Supabase

---

## 📞 Soporte

Si tienes problemas con el horario:
1. Verifica que las franjas horarias sean correctas
2. Revisa la consola del navegador (F12) para ver errores
3. Ejecuta el diagnóstico en Ajustes
4. Contacta con soporte si el problema persiste

---

**¡Horario actualizado y listo para usar!** 🎉

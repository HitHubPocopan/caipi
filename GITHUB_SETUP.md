# 📦 Crear Repositorio en GitHub

## Paso a Paso

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Llena los datos:
   - **Repository name**: `ProyectoCaipi` (o el nombre que prefieras)
   - **Description**: "Sistema de gestión de reservas para cabañas turísticas"
   - **Public**: ✅ (para poder desplegarlo en Vercel)
   - **Initialize with README**: ❌ (ya tenemos uno)
   - Haz click en **Create repository**

### 2. Copiar Comando HTTPS

En la página del repositorio, verás un botón verde **"Code"**
- Haz click en él
- Copia el URL que aparece (algo como: `https://github.com/tuusuario/ProyectoCaipi.git`)

### 3. Desde tu Computadora

Abre **PowerShell** o **CMD** y ejecuta:

```bash
cd c:\Users\54225\Desktop\ProyectoCaipi
git init
git add .
git commit -m "Inicial: Sistema de gestión de reservas"
git branch -M main
git remote add origin https://github.com/tuusuario/ProyectoCaipi.git
git push -u origin main
```

Reemplaza la URL con la que copiaste en el Paso 2.

### 4. Ingresar Credenciales

Si te pide usuario/contraseña:
- **Usuario**: tu nombre de usuario de GitHub
- **Contraseña**: **NO es tu contraseña** 
- Es un **Personal Access Token** (PAT)

#### Crear Personal Access Token:
1. Ve a https://github.com/settings/tokens
2. Haz click en **Generate new token (classic)**
3. Dale nombre: "ProyectoCaipi"
4. Selecciona: `repo` (acceso completo)
5. Haz click en **Generate token**
6. **Copia el token** (solo aparecerá una vez)
7. Úsalo como contraseña en el paso anterior

### 5. Verificar

Ve a https://github.com/tuusuario/ProyectoCaipi
Deberías ver todos tus archivos subidos ✅

---

## ✅ Comandos Útiles Para Después

### Subir cambios (después de editar archivos)

```bash
cd c:\Users\54225\Desktop\ProyectoCaipi
git add .
git commit -m "Descripción del cambio"
git push
```

### Ver estado del repositorio

```bash
git status
```

### Ver historial

```bash
git log --oneline
```

---

## 🚀 Ya está Listo para Vercel

Una vez que tu código esté en GitHub:

1. Ve a https://vercel.com/new
2. Haz click en "Import Project"
3. Selecciona GitHub
4. Busca tu repositorio "ProyectoCaipi"
5. Haz click en "Import"
6. Vercel detectará automáticamente que es un proyecto estático
7. Haz click en "Deploy"
8. **¡Listo!** Tu app estará en línea en ~1 minuto

---

## 🔑 Tips Importantes

- **Nunca compartir**:
  - Personal Access Token (PAT)
  - Supabase Keys (si fueran secretas)
  - Información sensible

- **Siempre escribir buenos commits**:
  ❌ `git commit -m "fix"`
  ✅ `git commit -m "Agregar validación de fechas en formulario"`

- **Hacer push regularmente**:
  - Protege tu código
  - Facilita colaboración
  - Es tu backup automático

---

¡Ya estás listo para compartir tu código en GitHub! 🎉

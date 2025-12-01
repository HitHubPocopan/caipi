# 📦 Guía Paso a Paso: Desplegar en Vercel

## ✅ Pre-requisitos

- **Cuenta en GitHub** (gratis en https://github.com)
- **Cuenta en Vercel** (gratis en https://vercel.com)
- **Git instalado** en tu computadora (descarga de https://git-scm.com)
- **Variables de entorno** de Supabase listas

---

## 🚀 PASO 1: Preparar Variables de Entorno

### 1.1 Crear archivo `.env.production`

En la raíz del proyecto (`c:\Users\54225\Desktop\ProyectoCaipi\`), crea un archivo llamado `.env.production` con:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Donde obtener estos valores:**
- Ve a https://app.supabase.com
- Selecciona tu proyecto
- En Settings → API, copia:
  - `Project URL` → `VITE_SUPABASE_URL`
  - `anon public` (en API KEYS) → `VITE_SUPABASE_ANON_KEY`

### 1.2 Crear archivo `.env.local` (para desarrollo local)

Crea `.env.local` con los mismos valores:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📂 PASO 2: Inicializar Repositorio Git Local

Abre la terminal/PowerShell en la carpeta del proyecto:

```powershell
cd c:\Users\54225\Desktop\ProyectoCaipi
```

### 2.1 Inicializar Git

```bash
git init
```

### 2.2 Agregar todos los archivos

```bash
git add .
```

### 2.3 Crear primer commit

```bash
git commit -m "Initial commit: Cabin reservation system"
```

---

## 🌐 PASO 3: Crear Repositorio en GitHub

### 3.1 Ir a GitHub

1. Ve a https://github.com/new
2. **Nombre del repositorio**: `cabin-reservation-system`
3. **Descripción**: Sistema de reserva de cabañas turísticas
4. **Visibility**: Public (recomendado)
5. **NO** inicialices con README, gitignore o license
6. Haz clic en **"Create repository"**

### 3.2 Conectar repositorio local con GitHub

En tu terminal/PowerShell:

```bash
git remote add origin https://github.com/TU_USUARIO/cabin-reservation-system.git
git branch -M main
git push -u origin main
```

**Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub**

---

## 🎯 PASO 4: Crear Cuenta en Vercel (si no tienes)

1. Ve a https://vercel.com
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tu GitHub
5. Verifica tu email

---

## 🚀 PASO 5: Desplegar en Vercel

### 5.1 Conectar repositorio

1. Ve a https://vercel.com/dashboard
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio `cabin-reservation-system`
4. Haz clic en **"Import"**

### 5.2 Configurar Build Settings

En la página de configuración del proyecto:

**Framework Preset**: `Other` (porque es HTML/CSS/JS vanilla)

**Build Command**: (dejar vacío o `echo "No build needed"`)

**Output Directory**: `.` (carpeta raíz)

**Environment Variables**: Agrega estas variables:

```
VITE_SUPABASE_URL = https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.3 Desplegar

Haz clic en **"Deploy"**

**¡Espera a que termine! (toma 1-2 minutos)**

---

## ✅ PASO 6: Verificar Despliegue

Una vez completado:

1. Verás un mensaje **"Deployment successful"**
2. Se genera una **URL** como: `https://cabin-reservation-system.vercel.app`
3. Haz clic en la URL para abrir tu aplicación

### 6.1 Pruebas rápidas

- ✅ Carga la página sin errores
- ✅ Se muestran las 6 cabañas
- ✅ El heatmap se carga correctamente
- ✅ Los botones de navegación funcionan
- ✅ Se puede abrir el calendario
- ✅ Se puede editar cabaña

---

## 🔄 PASO 7: Actualizaciones Futuras

Cada vez que hagas cambios locales:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Vercel automáticamente:**
- Detecta el push
- Realiza rebuild automático
- Actualiza la URL en 1-2 minutos

---

## 🆘 Solucionar Problemas

### Error: "No fue posible conectar a Supabase"
- ✅ Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctas
- ✅ Recopia desde Supabase (sin espacios)
- ✅ Redeploy con: `Revalidate` en el dashboard de Vercel

### Error: "Página 404"
- ✅ Asegúrate que `index.html` esté en la raíz
- ✅ Verifica que Output Directory sea `.`

### Las cabañas no se cargan
- ✅ Abre DevTools (`F12`)
- ✅ Ve a "Console" y busca errores
- ✅ Verifica la conexión a Supabase en Policies/RLS

### No puedo hacer push a GitHub
- ✅ Verifica que tengas acceso (SSH keys o PAT token)
- ✅ En Windows: Git solicita credenciales la primera vez

---

## 📝 Configuración Personalizada (Opcional)

### Dominio Personalizado

1. En Vercel Dashboard → Tu proyecto → Settings → Domains
2. Haz clic en "Add Domain"
3. Ingresa tu dominio (ej: cabanas.miempresa.com)
4. Sigue las instrucciones para configurar DNS

### Variables de Entorno Dinámicas

En Vercel Dashboard → Settings → Environment Variables:
- Puedes agregar variables diferentes por ambiente (Production, Preview, Development)

---

## 🎉 ¡Listo!

Tu aplicación está **en vivo** y accesible desde cualquier dispositivo con internet.

**URL pública**: Compartir con clientes/usuarios

**Próximos pasos:**
- [ ] Agregar dominio personalizado
- [ ] Configurar monitoreo de errors
- [ ] Realizar copias de seguridad de Supabase
- [ ] Implementar analytics

---

## 📞 Contacto & Soporte

Si tienes problemas:
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Help**: https://docs.github.com

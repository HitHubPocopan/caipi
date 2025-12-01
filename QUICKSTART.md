# ⚡ QUICKSTART - 10 Minutos para Tener tu App en Línea

## 🎯 El Plan

1. **Supabase Setup** (3 min) → Tabla de BD
2. **Configurar Keys** (2 min) → supabase.js
3. **Test Local** (1 min) → Abre index.html
4. **GitHub + Deploy** (4 min) → Vercel

---

## 1️⃣ Supabase - Crear BD (3 minutos)

### A. Crear Proyecto
```
1. Ve a https://supabase.com/dashboard
2. Crea nuevo proyecto
3. Espera ~2 minutos
```

### B. Crear Tablas
```
1. Ve a SQL Editor
2. Copia TODO el contenido de: database.sql
3. Pégalo y presiona RUN ▶
4. Listo! ✅
```

### C. Copiar Credenciales
```
Ve a Settings → API y copia:
- Project URL       (algo así: https://xxx.supabase.co)
- anon public key   (algo así: eyJ...)
```

---

## 2️⃣ Configurar supabase.js (2 minutos)

```javascript
// Abre: supabase.js
// Busca estas líneas en la parte superior:

const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_PUBLIC_KEY';

// Reemplaza con TUS valores:

const SUPABASE_URL = 'https://abc123def456.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...';

// Guarda (Ctrl+S)
```

---

## 3️⃣ Test Local (1 minuto)

### Opción A: Directo
```
1. Abre index.html en el navegador
2. O arrastra el archivo al navegador
```

### Opción B: Con Servidor (mejor)
```powershell
# PowerShell o CMD en la carpeta del proyecto
python -m http.server 8000
# Abre: http://localhost:8000
```

### Verificar que Funciona ✅
- [x] Ves 6 tarjetas de cabañas
- [x] Click en "Ver Calendario" abre calendario
- [x] Click en "AGREGAR RESERVA" abre formulario

---

## 4️⃣ GitHub + Vercel Deploy (4 minutos)

### A. GitHub
```bash
# En PowerShell/CMD en tu carpeta

git init
git add .
git commit -m "Inicial: Sistema de reservas"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/ProyectoCaipi.git
git push -u origin main
```

**Nota:** Reemplaza `TUUSUARIO` con tu usuario de GitHub

### B. Vercel
```
1. Ve a https://vercel.com/new
2. Haz login con GitHub
3. Selecciona tu repositorio "ProyectoCaipi"
4. Click en IMPORT
5. Vercel auto-configura (es estático)
6. Click en DEPLOY
7. Espera ~1 minuto
8. ¡URL en vivo! 🎉
```

---

## 🎊 ¡Listo!

Tu app estará en: `https://proyecto-caipi-algo.vercel.app`

---

## 🆘 Problema? Revisa esto:

| Problema | Solución |
|----------|----------|
| Página en blanco | F12 → Console → Lee el error |
| Cabañas no cargan | ¿Ejecutaste database.sql? |
| Error "Supabase" | ¿Copiaste bien las keys? |
| "Cannot find module" | ¿Todos los .js están en la misma carpeta? |

---

## 📞 Archivos Útiles

- `README.md` - Documentación completa
- `SETUP_GUIDE.md` - Pasos detallados
- `GITHUB_SETUP.md` - Crear repo en GitHub

---

**¿Preguntas?** Abre la consola (F12) y revisa los errores.

**¡Adelante! 🚀**

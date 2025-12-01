# ⚡ Comandos Rápidos para Vercel

## 1. Inicializar Git (PRIMERA VEZ)

```powershell
cd c:\Users\54225\Desktop\ProyectoCaipi
git init
git add .
git commit -m "Initial commit: Cabin reservation system"
```

---

## 2. Crear Repositorio GitHub

**En navegador:**
1. Ve a https://github.com/new
2. Nombre: `cabin-reservation-system`
3. Visibility: Public
4. Create repository

**En terminal:**
```powershell
git remote add origin https://github.com/TU_USUARIO/cabin-reservation-system.git
git branch -M main
git push -u origin main
```

---

## 3. Desplegar en Vercel

**Opción A: Conectar desde Vercel Dashboard (RECOMENDADO)**

1. Ve a https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Selecciona `cabin-reservation-system`
4. Build Settings:
   - Framework: `Other`
   - Build Command: (dejar vacío)
   - Output Directory: `.`
5. Agrega Environment Variables:
   ```
   VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY = tu-key-aqui
   ```
6. Click "Deploy"

**Opción B: CLI de Vercel**
```bash
npm install -g vercel
vercel
```

---

## 4. Actualizar Después de Cambios

```powershell
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Vercel automáticamente reconstruye y actualiza** ✨

---

## 5. Obtener Variables de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Settings → API
4. Copia:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

## 6. URL Final

Después del despliegue:
```
https://cabin-reservation-system.vercel.app
```

O tu dominio personalizado si lo configuraste.

---

## 🆘 Problemas Comunes

### "fatal: not a git repository"
```powershell
git init
git add .
git commit -m "Initial commit"
```

### "Permission denied"
- En Windows: Git pedirá credenciales
- En Mac/Linux: Configura SSH keys: `ssh-keygen -t ed25519`

### "Build failed"
- Verifica que `index.html` esté en la raíz
- Revisa la consola de Vercel para detalles

### Variables de entorno no funcionan
- En HTML vanilla: Vercel no procesa `.env` por defecto
- Solución: Usa `vercel env pull` para copiar vars localmente
- Crea `config.js` con las URLs

---

## ✅ Checklist Final

- [ ] Git inicializado
- [ ] Repositorio GitHub creado
- [ ] Push a main realizado
- [ ] Cuenta Vercel creada
- [ ] Proyecto importado en Vercel
- [ ] Environment variables agregadas
- [ ] Deploy completado
- [ ] URL accesible
- [ ] Cabañas cargadas
- [ ] Heatmap visible
- [ ] Botón "Editar" funciona
- [ ] Botones de mes navegan

**¡Listo para producción!** 🎉

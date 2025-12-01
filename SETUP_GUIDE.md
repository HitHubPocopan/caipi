# 🚀 Guía Rápida de Configuración

## 5 Pasos para Poner en Funcionamiento

### Paso 1: Crear Proyecto en Supabase (5 min)

1. Ve a https://supabase.com y registrate
2. Crea un nuevo proyecto (selecciona región)
3. Espera a que se cree (~ 2 min)
4. En **Settings → API**, copia:
   - **Project URL** → `YOUR_SUPABASE_URL`
   - **anon public** → `YOUR_SUPABASE_PUBLIC_KEY`

### Paso 2: Crear Base de Datos (3 min)

1. En Supabase, ve a **SQL Editor**
2. Haz click en **New Query**
3. Copia TODO el contenido del archivo `database.sql`
4. Pégalo en el editor y haz click en **Run**
5. Verifica que no hay errores

### Paso 3: Configurar la App (2 min)

1. Abre el archivo `supabase.js` con un editor de texto
2. Busca estas líneas (arriba del archivo):
   ```javascript
   const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
   const SUPABASE_KEY = 'YOUR_SUPABASE_PUBLIC_KEY';
   ```
3. Reemplaza los valores con los que copiaste en Paso 1:
   ```javascript
   const SUPABASE_URL = 'https://xyzqwerty.supabase.co';
   const SUPABASE_KEY = 'eyJhbGc...';
   ```
4. Guarda el archivo (Ctrl+S)

### Paso 4: Probar Localmente (Opcional)

**Opción A: Python (Si tienes Python instalado)**
```bash
cd c:\Users\54225\Desktop\ProyectoCaipi
python -m http.server 8000
```
Abre http://localhost:8000 en el navegador

**Opción B: Node.js (Si tienes Node instalado)**
```bash
npx http-server
```

**Opción C: Directamente**
- Descarga los archivos
- Abre `index.html` en el navegador (arrastra el archivo)

### Paso 5: Desplegar a Producción (1-5 min)

#### 🟦 **Opción A: Vercel (RECOMENDADO)**
1. Crea cuenta en https://vercel.com
2. Conecta tu cuenta de GitHub
3. Importa el repositorio
4. Vercel automáticamente detecta que es estático
5. **Deploy completado** ✅
6. Tu app estará en: `https://tu-nombre.vercel.app`

#### 🟧 **Opción B: Netlify**
1. Crea cuenta en https://netlify.com
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. Haz deploy
5. Tu app estará en: `https://tu-nombre.netlify.app`

#### 🟩 **Opción C: GitHub Pages (GRATIS)**
1. Sube los archivos a GitHub
2. Ve a Settings → Pages
3. Selecciona "Deploy from branch"
4. Elige main branch
5. Tu app estará en: `https://usuario.github.io/ProyectoCaipi`

---

## ✅ Verificar que Funciona

Después de completar los pasos:

1. Abre la aplicación
2. Deberías ver 6 tarjetas de cabañas
3. Haz click en "Ver Calendario"
4. Haz click en "AGREGAR RESERVA"
5. Si se abre el formulario → ✅ **¡FUNCIONA!**

---

## 📱 URLs Útiles

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Netlify Dashboard**: https://app.netlify.com

---

## 🆘 Si Algo No Funciona

### "Error: Supabase URL no definida"
→ Verifica que completaste correctamente `supabase.js` (Paso 3)

### "Página en blanco"
→ Abre DevTools (F12) → Console y verifica errores

### "Las cabañas no cargan"
→ Verifica que ejecutaste el SQL de `database.sql` (Paso 2)

### "No puedo crear reservas"
→ Verifica que copiaste correctamente la clave pública (Paso 1)

---

## 📞 Contacto Rápido

Si necesitas ayuda:
1. Revisa la consola (F12 → Console)
2. Verifica que Supabase está online
3. Recarga la página (Ctrl+Shift+R)

---

**¡Ya estás listo para gestionar tus reservas! 🏡**

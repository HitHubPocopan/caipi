# ✅ Checklist de Despliegue

Usa esta lista para verificar que todo está listo antes de desplegar a producción.

## Pre-Deployment

### Configuración Local
- [ ] Supabase URL en `supabase.js` (línea 1)
- [ ] Supabase Key en `supabase.js` (línea 2)
- [ ] `database.sql` ejecutado en Supabase
- [ ] RLS habilitado en todas las tablas
- [ ] 6 cabañas pre-cargadas en BD

### Funcionamiento Local
- [ ] Abre `index.html` en navegador
- [ ] Ves 6 tarjetas de cabañas
- [ ] Click "Ver Calendario" funciona
- [ ] Calendario carga datos de Supabase
- [ ] Puedo crear una reserva
- [ ] Puedo editar una reserva
- [ ] Puedo eliminar una reserva
- [ ] Toast notifications funcionan

### Navegadores Probados
- [ ] Chrome / Edge
- [ ] Firefox
- [ ] Safari (si tienes Mac)
- [ ] Móvil (iPhone o Android)

### Responsividad
- [ ] Móvil (375px ancho): Funciona correctamente
- [ ] Tablet (768px ancho): 2 columnas de cabañas
- [ ] Desktop (1024px+ ancho): 3 columnas de cabañas

## Preparar para Producción

### Seguridad
- [ ] No hay claves hardcodeadas en archivos
- [ ] Solo clave pública (anon) en frontend
- [ ] RLS habilitado en Supabase
- [ ] Políticas RLS revisadas

### Performance
- [ ] Imágenes optimizadas (si las hay)
- [ ] CSS está minimizado (o lo minimizará Vercel)
- [ ] JavaScript está optimizado
- [ ] No hay console.log() en producción *(opcional)*

### SEO & Meta Tags
- [ ] Title actualizado: "Gestión de Reservas - Cabañas"
- [ ] Meta description en index.html *(opcional)*
- [ ] Favicon agregado *(opcional)*

## GitHub & Vercel

### GitHub
- [ ] Repositorio creado
- [ ] `git init` ejecutado
- [ ] `git add .` y `git commit` hecho
- [ ] `git push` completado
- [ ] Archivos visibles en GitHub

### Vercel
- [ ] Vercel conectado a GitHub
- [ ] Repositorio importado
- [ ] Build settings automáticos (no cambiados)
- [ ] Deploy inicial hecho
- [ ] URL en vivo generada

### Validar URL en Vivo
- [ ] App carga correctamente
- [ ] 6 cabañas visibles
- [ ] Calendario funciona
- [ ] Crear reserva funciona
- [ ] Datos persistentes

## Post-Deployment

### Monitoreo Inicial
- [ ] Vercel shows "Ready"
- [ ] No hay errores en console (F12)
- [ ] Supabase requests exitosos (Network tab)
- [ ] Reservas se guardan en BD

### Compartir
- [ ] URL compartida con cliente
- [ ] Cliente confirma que funciona
- [ ] Documentación actualizada
- [ ] Archivo SETUP completo

## Problemas Comunes

### Si la app no carga
- [ ] Verifica: ¿URL de Supabase correcta?
- [ ] Verifica: ¿Key pública correcta?
- [ ] Abre DevTools (F12) → Console
- [ ] Revisa error exacto

### Si las cabañas no se ven
- [ ] ¿Ejecutaste `database.sql`?
- [ ] ¿Las 6 cabañas están en BD?
- [ ] ¿Request a Supabase es exitoso? (Network tab)

### Si no puedo crear reservas
- [ ] ¿RLS está habilitado?
- [ ] ¿Políticas WRITE están OK?
- [ ] Revisa error en console (F12)

### Si reservas no se guardan
- [ ] Verifica: Connection a Supabase
- [ ] Verifica: Tabla `reservas` existe
- [ ] Verifica: Tabla `dias_reserva` existe

---

## Documentación Necesaria

Antes de entregar al cliente, asegúrate de:

- [ ] Proporcionar README.md
- [ ] Proporcionar SETUP_GUIDE.md
- [ ] Proporcionar URL de producción
- [ ] Proporcionar credenciales de Supabase (si necesita acceso)
- [ ] Proporcionar instrucciones de cambio de datos

---

## Script de Verificación Rápida

```javascript
// Abre DevTools (F12) → Console y ejecuta:

console.log('Supabase:', window.supabase ? '✅' : '❌');
console.log('App loaded:', window.cabanas ? '✅' : '❌');
console.log('Total cabanas:', window.cabanas?.length || '❌');
```

---

## URLs Importantes

- **Tu App**: https://tu-nombre.vercel.app
- **GitHub Repo**: https://github.com/tuusuario/ProyectoCaipi
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Entrega Final

Una vez todo esté verificado:

```
✅ Código en GitHub
✅ Despliegue en Vercel
✅ Dominio personalizado (si lo requiere)
✅ Documentación entregada
✅ Cliente confirmó funcionamiento
```

---

## Mantenimiento Post-Despliegue

- [ ] Monitorear errores de Vercel (emails)
- [ ] Revisar logs de Supabase mensualmente
- [ ] Actualizar dependencias (FontAwesome CDN)
- [ ] Hacer backups de BD en Supabase
- [ ] Mantener documentación actualizada

---

**¡Listo para lanzar! 🚀**

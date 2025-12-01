# Sistema de Gestión de Reservas - Cabañas Turísticas

Aplicación web completa para gestionar reservas de 6 cabañas turísticas. Construida con HTML5, CSS3 y JavaScript vanilla, con backend en Supabase (PostgreSQL).

## 📋 Características

- ✅ Calendario mensual interactivo para cada cabaña
- ✅ Agregar reservas de múltiples días en una sola operación
- ✅ División visual AM/PM en días individuales
- ✅ Gestión de reservas en tiempo real
- ✅ Almacenamiento persistente en Supabase
- ✅ Diseño completamente responsive (mobile-first)
- ✅ Información detallada del cliente (nombre, teléfono, cantidad de personas)
- ✅ Control de ocupación por pago
- ✅ Edición y eliminación de reservas

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. Copia tu `Supabase URL` y `Anon Public Key` desde Settings → API

### 2. Crear Base de Datos

1. En el panel de Supabase, ve a SQL Editor
2. Crea una nueva query
3. Copia y ejecuta el contenido del archivo `database.sql`
4. Esto creará las 3 tablas necesarias con sus políticas RLS

### 3. Configurar la Aplicación

1. Abre `supabase.js`
2. Reemplaza:
   - `YOUR_SUPABASE_URL` con tu URL de Supabase
   - `YOUR_SUPABASE_PUBLIC_KEY` con tu clave pública

**Ejemplo:**
```javascript
const SUPABASE_URL = 'https://xyznqwerty.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 4. Desplegar

#### Opción A: Vercel (Recomendado)

1. Sube los archivos a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Selecciona "Import Project"
4. Elige tu repositorio
5. Vercel automáticamente detectará que es un proyecto estático
6. Deploy completado

#### Opción B: Netlify

1. Sube los archivos a GitHub
2. Ve a [netlify.com](https://netlify.com)
3. Conecta tu repositorio
4. Deploy automático en cada push

#### Opción C: Hosting Estático

Sube los archivos a cualquier servidor web:
- Hosting gratuito: Netlify, Vercel, GitHub Pages, Firebase Hosting
- Hosting pagado: AWS S3, Google Cloud, etc.

## 📁 Estructura de Archivos

```
ProyectoCaipi/
├── index.html           # HTML estructura principal
├── style.css            # Estilos CSS responsive
├── app.js               # Lógica principal de la aplicación
├── calendar.js          # Generación y gestión de calendario
├── reservas.js          # Gestión de formularios de reservas
├── supabase.js          # Configuración y funciones CRUD de Supabase
├── database.sql         # Script SQL para crear tablas
├── .env.example         # Variables de entorno (ejemplo)
└── README.md            # Este archivo
```

## 🎨 Estructura de Base de Datos

### Tabla: `cabanas`
```sql
- id (UUID)
- numero (1-6)
- descripcion (TEXT)
- capacidad (INTEGER)
- precio_base (DECIMAL)
- activa (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

### Tabla: `reservas`
```sql
- id (UUID)
- cabana_id (FK)
- cliente_nombre (VARCHAR)
- cliente_telefono (VARCHAR)
- cantidad_personas (INTEGER)
- fecha_inicio (DATE)
- fecha_fin (DATE)
- estado_pago (VARCHAR: 'pendiente', 'pagado', 'parcial')
- monto_total (DECIMAL)
- monto_pagado (DECIMAL)
- notas (TEXT)
- created_at, updated_at (TIMESTAMPS)
```

### Tabla: `dias_reserva`
```sql
- id (UUID)
- reserva_id (FK)
- fecha (DATE)
- ocupacion_am (BOOLEAN)
- ocupacion_pm (BOOLEAN)
- precio_dia (DECIMAL)
- notas_dia (TEXT)
- created_at (TIMESTAMP)
```

## 🎯 Cómo Usar

### Página Principal
1. Ves 6 tarjetas de cabañas
2. Cada tarjeta muestra capacidad, precio y descripción
3. Click en "Ver Calendario" para abrir el calendario de esa cabaña

### Calendario Mensual
1. Navega entre meses con los botones ◀ ▶
2. Los días ocupados se muestran en azul
3. Los medios días se muestran con gradientes (AM/PM)
4. Hoy está marcado con un punto azul

### Agregar Reserva
1. Click en "AGREGAR RESERVA"
2. Completa datos del cliente
3. Selecciona fechas:
   - Click en un día para seleccionar
   - Shift+Click en otro día para seleccionar rango
4. Para cada día, elige: AM / Día Completo / PM
5. Ingresa detalles de pago
6. Haz click en "Guardar Reserva"

### Editar Reserva
1. Click en un día ocupado
2. Se abre el modal de edición
3. Modifica los datos que necesites
4. Haz click en "Guardar Cambios"

### Eliminar Reserva
1. Abre una reserva (click en día ocupado)
2. Haz click en "Eliminar Reserva"
3. Confirma la eliminación

## 🎨 Paleta de Colores

```css
Disponible: #e8f5e9 (Verde claro)
Ocupado completo: #bbdefb (Azul)
Ocupado AM: Gradiente azul arriba / verde abajo
Ocupado PM: Gradiente verde arriba / azul abajo
Mantenimiento: #f5f5f5 (Gris)
Bloqueado: #ffcdd2 (Rojo claro)
Seleccionado: #fff9c4 (Amarillo)
Primary: #2196F3 (Azul)
```

## 📱 Responsividad

- **Móvil** (< 768px): 1 columna de cabañas, calendario compacto
- **Tablet** (768px - 1024px): 2 columnas de cabañas
- **Desktop** (1024px - 1400px): 3 columnas de cabañas
- **Pantalla Grande** (> 1400px): 6 columnas de cabañas

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de acceso público para lectura
- CRUD operations disponibles para todos (ajustable según necesidad)

**Para producción**, modifica las políticas RLS en `database.sql` para restricción por usuario:

```sql
CREATE POLICY "Solo usuarios autenticados pueden escribir" ON reservas
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

## 🔄 Sincronización en Tiempo Real

Si abres la aplicación en múltiples dispositivos:
- Los cambios en una pestaña se reflejan automáticamente
- Implementa suscripciones de Supabase para actualizaciones en tiempo real (opcional)

## ⚙️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Iconos**: Font Awesome 6.4
- **Autenticación**: RLS de Supabase
- **Hosting**: Vercel, Netlify o servidor estático

## 🛠️ Troubleshooting

### "Error: Supabase URL o Key no configuradas"
**Solución**: Verifica que completaste correctamente las constantes en `supabase.js`

### "Las reservas no se guardan"
**Solución**: 
1. Verifica que ejecutaste el SQL de `database.sql`
2. Comprueba que RLS está habilitado correctamente
3. Revisa la consola (F12) para errores detallados

### "El calendario no carga"
**Solución**:
1. Verifica la conexión a Internet
2. Abre DevTools (F12) → Console para errores
3. Comprueba que el URL y Key de Supabase son correctos

### "Responsive no funciona en móvil"
**Solución**: Verifica que tienes el meta tag en HTML:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 📝 Roadmap Futuro

- [ ] Exportar calendario a PDF
- [ ] Envío de confirmaciones por email/WhatsApp
- [ ] Sistema de disponibilidad online
- [ ] Integración con pasarelas de pago
- [ ] Reportes y análisis de ocupación
- [ ] Sincronización con Google Calendar
- [ ] Aplicación móvil nativa

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la consola del navegador (F12)
2. Verifica la documentación de Supabase
3. Consulta los logs de tu hosting

## 📄 Licencia

Código libre para uso personal y comercial.

---

**¡Feliz gestión de reservas! 🏡**

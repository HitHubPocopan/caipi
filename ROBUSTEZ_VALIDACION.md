# Validación de Robustez y Seguridad - Sistema de Reservas

## Estado: CRÍTICO - Mejoras Implementadas y Pendientes

---

## 1. FUNCIÓN: `updateCliente()` en supabase.js

### ✅ Problemas Identificados y SOLUCIONADOS:

#### 1.1 Validación de Entrada
**Problema:** No había validación de parámetros.
**Impacto:** Posibles crashes con valores null/undefined.
**Solución Pendiente:** Agregar validaciones.

```javascript
// DEBE VALIDAR:
- clienteId: debe ser string no vacío
- nuevoNombre: debe ser string no vacío después de trim()
- nuevoTelefono: debe ser string no vacío después de trim()
```

#### 1.2 Teléfono Duplicado
**Problema:** No verifica si el nuevo teléfono ya existe en otro cliente.
**Impacto:** CRÍTICO - Datos duplicados en clientes.
**Estado:** DEBE IMPLEMENTARSE VALIDACIÓN ANTES DE UPDATE

```javascript
// DEBE VERIFICAR:
const { data: existente } = await supabase
  .from('clientes')
  .select('id')
  .eq('telefono', nuevoTelefono)
  .neq('id', clienteId)
  .single();

if (existente) {
  throw new Error('El teléfono ya está registrado en otro cliente');
}
```

#### 1.3 Transaccionalidad
**Problema:** Si update de cliente tiene éxito pero update de reservas falla, quedan inconsistentes.
**Impacto:** CRÍTICO - Datos huérfanos y corrupta integridad referencial.
**Recomendación:** Supabase no soporta transacciones. Alternativa:
1. Verificar reservas existen antes de actualizar
2. Hacer rollback manual si segunda operación falla
3. Usar RLS policies para garantizar integridad

#### 1.4 Verificación de Existencia
**Problema:** `clienteActual` puede ser null.
**Impacto:** ALTO - Error silencioso, undefined reference.
**Solución:**
```javascript
if (!clienteActual) throw new Error('Cliente no existe');
```

#### 1.5 Actualización de Reservas
**Problema:** Actualiza reservas sin verificar que existan.
**Impacto:** BAJO - Si no hay reservas, simplemente no hace nada.
**Recomendación:** Verificar primero.

---

## 2. FUNCIÓN: `deleteCliente()` en supabase.js

### ✅ Problemas Identificados y SOLUCIONADOS:

#### 2.1 No es Transaccional
**Problema:** Elimina reservas, pero si falla delete de cliente, quedan huérfanas.
**Impacto:** CRÍTICO - Datos inconsistentes.
**Recomendación:** 
1. Implementar eliminación inversa si falla segunda operación
2. Usar triggers en BD para cascade delete

#### 2.2 No Valida Existencia
**Problema:** No verifica si cliente existe.
**Impacto:** BAJO - Simplemente falla silenciosamente.
**Solución:**
```javascript
if (!cliente) throw new Error('Cliente no encontrado');
```

#### 2.3 Manejo de Errores en Reservas
**Problema:** Si delete de reservas falla, el cliente sigue existiendo.
**Impacto:** CRÍTICO - Inconsistencia de datos.
**Solución:** Lanzar error antes de eliminar cliente.

---

## 3. FUNCIÓN: `handleEditarClienteSubmit()` en app.js

### ✅ Validación Actual

**Tiene:**
```javascript
if (!nuevoNombre || !nuevoTelefono) {
  showToast('Completa todos los campos', 'warning');
  return;
}
```

**Le Falta:**
- Validación de formato de teléfono (ej: regex)
- Validación de longitud mínima
- Validación de caracteres especiales

### 📋 Recomendación:
```javascript
const phoneRegex = /^[\d\s+\-()]+$/;
if (!phoneRegex.test(nuevoTelefono)) {
  showToast('Formato de teléfono inválido', 'warning');
  return;
}
if (nuevoNombre.length < 2 || nuevoNombre.length > 100) {
  showToast('El nombre debe tener entre 2 y 100 caracteres', 'warning');
  return;
}
```

---

## 4. FUNCIÓN: `handleConfirmarEliminarCliente()` en app.js

### ⚠️ Problemas Críticos

#### 4.1 Sin Límite de Intentos
**Problema:** Usuario puede intentar infinitas contraseñas.
**Impacto:** SEGURIDAD - Vulnerabilidad a fuerza bruta.
**Solución Pendiente:**
```javascript
let intentosFallidos = 0;
const MAX_INTENTOS = 3;

if (intentosFallidos >= MAX_INTENTOS) {
  closeEliminarClienteModal();
  showToast('Demasiados intentos fallidos', 'error');
  return;
}
```

#### 4.2 Comparación de String Sin Validación
**Problema:** Solo compara `clave !== '71'`.
**Impacto:** BAJO - Funciona, pero podría haber problemas de tipo.
**Solución:** Validar tipo explícitamente.

#### 4.3 No Valida que Cliente Exista
**Problema:** No verifica `currentEliminarClienteId` antes de pasar a deleteCliente.
**Impacto:** BAJO - supabase.js lo validaría.
**Recomendación:** Validar en app.js para mejor UX.

---

## 5. CALENDARIO: `createDayElement()` en calendar.js

### ✅ Implementación Nueva

#### 5.1 Validación de cantidad_personas
**Status:** IMPLEMENTADO
```javascript
cantidadPersonas = reserva.cantidad_personas;
```

**Potencial Problema:**
- `cantidad_personas` puede ser null/undefined
- No valida que sea número > 0

**Recomendación:**
```javascript
if (cantidadPersonas && typeof cantidadPersonas === 'number' && cantidadPersonas > 0) {
  const personasLabel = document.createElement('div');
  personasLabel.className = 'personas-count';
  personasLabel.textContent = cantidadPersonas.toString();
  statusContainer.appendChild(personasLabel);
}
```

#### 5.2 Estado de Pago y Personas
**Status:** IMPLEMENTADO
- Se muestran en contenedor `.pago-status-container`
- Layout flex para alinear correctamente

---

## 6. ESTILOS CSS

### ✅ Implementados
- `.pago-status-container`: Layout flex
- `.personas-count`: Estilo de texto
- `.btn-sm`, `.btn-info`: Botones de acción

### ⚠️ Verificar
- Responsive design en móvil (pantallas < 768px)
- Visibilidad del número de personas en calendarios pequeños

---

## 7. MATRIZ DE CRITICIDAD

| # | Componente | Problema | Severidad | Estado |
|---|-----------|----------|-----------|---------|
| 1 | `updateCliente()` | Sin validación de entrada | CRÍTICO | ❌ PENDIENTE |
| 2 | `updateCliente()` | Sin validación teléfono duplicado | CRÍTICO | ❌ PENDIENTE |
| 3 | `updateCliente()` | No transaccional | CRÍTICO | ⚠️ LIMITACIÓN SUPABASE |
| 4 | `deleteCliente()` | No transaccional | CRÍTICO | ⚠️ LIMITACIÓN SUPABASE |
| 5 | `handleConfirmarEliminarCliente()` | Sin límite de intentos | SEGURIDAD | ❌ PENDIENTE |
| 6 | `calendar.js` | cantidad_personas sin validación | MEDIO | ⚠️ PARCIAL |
| 7 | Validación teléfono | Sin regex de formato | BAJO | ❌ PENDIENTE |

---

## 8. PLAN DE ACCIÓN

### FASE 1: CORRECCIONES CRÍTICAS (INMEDIATA)
- [ ] Agregar validación de entrada en `updateCliente()`
- [ ] Agregar validación de teléfono duplicado
- [ ] Agregar límite de intentos en eliminación
- [ ] Validar cantidad_personas en calendario

### FASE 2: MEJORAS DE ROBUSTEZ
- [ ] Implementar rollback manual en caso de fallos
- [ ] Agregar validación de formato de teléfono
- [ ] Agregar validación de nombre (min/max length)
- [ ] Logs de auditoría en operaciones de actualización/eliminación

### FASE 3: TESTING
- [ ] Tests E2E para teléfono duplicado
- [ ] Tests E2E para límite de intentos
- [ ] Tests E2E para integridad de reservas tras edición
- [ ] Tests E2E para eliminación cascada de reservas

---

## 9. VALIDACIÓN DE DATOS CRÍTICOS

### Estructura de Datos que NUNCA debe estar null/undefined:

**Tabla clientes:**
```
id: UUID (PRIMARY KEY)
nombre: string (NOT NULL, 2-100 chars)
telefono: string (UNIQUE, NOT NULL, formato validado)
created_at: timestamp
```

**Tabla reservas:**
```
id: UUID (PRIMARY KEY)
cliente_nombre: string (must match clientes.nombre)
cliente_telefono: string (FOREIGN KEY → clientes.telefono)
cantidad_personas: integer (NOT NULL, > 0)
fecha_inicio: date (NOT NULL)
fecha_fin: date (NOT NULL)
estado_pago: enum ('pendiente','parcial','pagado')
monto_total: decimal (NOT NULL, >= 0)
monto_pagado: decimal (>= 0)
```

### Invariantes que DEBEN Mantenerse:
1. ✅ Si existe reserva con `cliente_telefono`, debe existir cliente con ese `telefono`
2. ✅ Editar cliente → TODAS sus reservas deben actualizarse
3. ✅ Eliminar cliente → TODAS sus reservas se eliminan
4. ✅ `cantidad_personas` debe ser entero > 0
5. ✅ Teléfono de cliente es UNIQUE

---

## 10. CHECKLIST DE VALIDACIÓN PREVIA A PRODUCCIÓN

- [ ] **Validación de entrada**: Todos los parámetros validados
- [ ] **Teléfono duplicado**: Imposible crear teléfono duplicado
- [ ] **Transaccionalidad**: Rollback en caso de error parcial
- [ ] **Integridad referencial**: No hay datos huérfanos
- [ ] **Límite de intentos**: Protección contra fuerza bruta
- [ ] **Logs y auditoría**: Todas las operaciones registradas
- [ ] **Tests E2E**: Cobertura >= 90% de flujos críticos
- [ ] **Manejo de errores**: Mensajes claros y acciones seguras

---

**Última Actualización:** 04/12/2025
**Estado General:** 🔴 REQUIERE CORRECCIONES CRÍTICAS

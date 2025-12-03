# 🎯 Cambios en Sección de Pagos - Versión 2

## ✅ Nuevas Características Implementadas

### 1. **Botón de Pago Parcial (Naranja)**
- Nuevo botón en cada tarjeta de pago pendiente/parcial
- Color: Naranja (#ff9800)
- Icono: + (más)
- Abre un modal para ingresar el monto

### 2. **Modal de Pago Parcial**
Cuando haces clic en "Pago Parcial":
- Se abre un recuadro con:
  - Nombre del cliente (deshabilitado)
  - Monto Total (deshabilitado)
  - Monto ya Pagado (deshabilitado)
  - Deuda Actual (deshabilitado)
  - **INPUT: Monto a Pagar Ahora** (editable)
  - Botón "Registrar Pago" (azul)
  - Botón "Cancelar" (gris)

### 3. **Lógica de Suma**
Cuando registras un pago parcial:
1. Se suma el monto nuevo al monto ya pagado
   - `nuevoMontoPagado = montoPagado + montoNuevo`
2. Se valida que no exceda la deuda actual
3. El estado se actualiza:
   - Si `nuevoMontoPagado >= montoTotal` → **"pagado"** (desaparece de pendientes)
   - Si `nuevoMontoPagado < montoTotal` → **"parcial"** (naranja)

### 4. **Dos Botones por Tarjeta**
Ahora cada tarjeta de pago tiene dos botones:

| Botón | Color | Función |
|-------|-------|---------|
| Pago Parcial | 🟠 Naranja | Abre modal para suma parcial |
| Pagado Completo | 🟢 Verde | Marca como completamente pagado |

### 5. **Buscador en Mobile**
- Busca por nombre del cliente
- Filtra en tiempo real (mientras escribes)
- Solo busca en pagos pendientes/parciales

### 6. **Botón Ver/Ocultar Pagos Realizados**
- Por defecto: **Ocultos** (en mobile especialmente)
- Botón: "Ver Pagos Realizados (N)" / "Ocultar Pagos Realizados (N)"
- Mostrará/ocultará la columna de pagos completados
- Contador actualizado dinámicamente

---

## 📝 Archivos Modificados

### `index.html` (Líneas 344-382)
```html
<!-- MODAL: Pago Parcial -->
<div id="modal-pago-parcial" class="modal hidden">
  <div class="modal-content">
    <form id="form-pago-parcial">
      <!-- Campos de información (deshabilitados) -->
      <!-- Campo editable: pago-monto-nuevo -->
    </form>
  </div>
</div>
```

### `app.js` (Líneas 435-632)

**Nuevas Funciones:**
- `renderPagosTab()` - Reescrita con nuevas características
- `openPagoParcialModal()` - Abre modal con datos precargados
- `closePagoParcialModal()` - Cierra y limpia modal

**Variable Global:**
- `mostrarPagosCompletados` - Controla si se muestran pagos completados

**Características:**
- Buscador en tiempo real
- Toggle para mostrar/ocultar pagos completados
- Dos botones por tarjeta (parcial + completo)
- Validaciones en el modal

### `app.js` (setupEventListeners)
```javascript
document.getElementById('btn-close-pago-modal').addEventListener('click', closePagoParcialModal);
document.getElementById('btn-cancel-pago-modal').addEventListener('click', closePagoParcialModal);
```

### `style.css` (Líneas 1595-1688)

**Nuevas Clases:**
- `.pagos-buscador-container` - Contenedor del buscador
- `.pagos-search-wrapper` - Wrapper del input de búsqueda
- `.pagos-search-input` - Input de búsqueda
- `.pagos-toggle-btn` - Botón de ver/ocultar
- `.pago-card-botones` - Contenedor de dos botones
- `.pago-btn-parcial` - Botón de pago parcial naranja

**Responsivo:**
- Mobile ≤768px: Buscador y botón a pantalla completa
- Mobile ≤768px: Botones apilados verticalmente

---

## 🎯 Flujo de Uso - Pago Parcial

### Escenario 1: Pago Pendiente → Pago Parcial
```
1. Cliente: "Juan García" | Total: $1000 | Pagado: $0 | Deuda: $1000 | Estado: Pendiente (🔴)
2. Click: "Pago Parcial"
3. Modal abre:
   - Monto a Pagar Ahora: [___] (ingresa 300)
   - Click: "Registrar Pago"
4. Resultado:
   - Cliente: "Juan García" | Total: $1000 | Pagado: $300 | Deuda: $700 | Estado: Parcial (🟠)
```

### Escenario 2: Pago Parcial → Pago Completo (vía parcial)
```
1. Cliente: "Juan García" | Total: $1000 | Pagado: $300 | Deuda: $700 | Estado: Parcial (🟠)
2. Click: "Pago Parcial"
3. Modal abre:
   - Monto a Pagar Ahora: [___] (ingresa 700)
   - Click: "Registrar Pago"
4. Resultado:
   - ✅ Desaparece de Pagos Pendientes
   - ✅ Aparece en Pagos Completados (si mostrarPagosCompletados = true)
   - Estado: Pagado (🟢)
```

### Escenario 3: Validación de Monto
```
1. Modal abierto
2. Monto a Pagar: $800 (pero deuda actual = $700)
3. Click: "Registrar Pago"
4. Resultado: ❌ "El monto no puede ser mayor a la deuda ($700.00)"
```

---

## 🔍 Búsqueda en Mobile

```
┌─────────────────────────────────────────┐
│ 🔍 Buscar cliente...                    │
├─────────────────────────────────────────┤
│ [Ver Pagos Realizados (5)]              │
├─────────────────────────────────────────┤
│ PAGOS PENDIENTES                        │
├─────────────────────────────────────────┤
│ Juan García          (Coincide)         │
│ - Total: $1000                          │
│ - Pagado: $300                          │
│ - Deuda: $700                           │
│ [Pago Parcial] [Pagado Completo]        │
├─────────────────────────────────────────┤
│ María López          (No coincide)       │
│ - (Oculto)                              │
├─────────────────────────────────────────┤
│ Pedro Rodríguez      (Coincide)         │
│ - Total: $500                           │
│ - Pagado: $0                            │
│ - Deuda: $500                           │
│ [Pago Parcial] [Pagado Completo]        │
└─────────────────────────────────────────┘
```

---

## 💾 Cambios en Base de Datos

**No se requieren cambios en Supabase**

Los cambios usan campos existentes:
- `estado_pago` (pendiente, parcial, pagado)
- `monto_total`
- `monto_pagado`

---

## 📊 Comparación: Antes vs Después

### ANTES
```
┌─────────────────────────────────────┐
│ PAGOS PENDIENTES                    │
├─────────────────────────────────────┤
│ Juan García                         │
│ Total: $1000 | Pagado: $0           │
│ [Pagado Completo]                   │
└─────────────────────────────────────┘
```

### DESPUÉS
```
┌─────────────────────────────────────┐
│ 🔍 [Buscar...]  [Ver Realizados (5)]│
├─────────────────────────────────────┤
│ Juan García          (🟠 Parcial)   │
│ Total: $1000 | Pagado: $300         │
│ Deuda: $700                         │
│ ┌─────────────────┬────────────────┐│
│ │[Pago Parcial]  │[Pagado Completo]││
│ └─────────────────┴────────────────┘│
└─────────────────────────────────────┘
```

---

## 🧪 Testing

### Test 1: Pago Parcial
1. Crear una reserva con estado "Pendiente" de $1000
2. Click "Pago Parcial"
3. Ingresar $300
4. Verificar: Estado → "Parcial", Pagado → $300, Deuda → $700

### Test 2: Completar Pago Parcial
1. Tener un pago en estado "Parcial" con $300 pagados de $1000
2. Click "Pago Parcial"
3. Ingresar $700
4. Verificar: Desaparece de Pendientes, Estado → "Pagado"

### Test 3: Búsqueda
1. Tener 3 pagos pendientes: "Juan", "María", "Pedro"
2. Buscar "J"
3. Verificar: Solo "Juan" visible

### Test 4: Ver/Ocultar Completados
1. Tener 2 completados, 3 pendientes
2. Click "Ver Pagos Realizados (2)"
3. Verificar: Muestra columna con pagos completados
4. Click "Ocultar Pagos Realizados (2)"
5. Verificar: Oculta la columna

---

## 🚀 Próximos Pasos

1. ✅ Código implementado
2. ✅ Estilos CSS añadidos
3. ✅ Modal con validaciones
4. ✅ Búsqueda en tiempo real
5. ✅ Lógica de suma de montos
6. ⏭️ Probar en navegador (F5 en clientes → Pagos)

¡Listo para usar! 🎉

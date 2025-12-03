let cabanas = [];
const CORRECT_PASSWORD = '7154';

let allReservas = [];
let allDiasReserva = [];
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();
const clienteColores = {};
const paletaColores = [
  '#FFE5E5', '#E5F5FF', '#E5FFE5', '#FFF5E5', '#F5E5FF', '#FFE5F5',
  '#FFD1D1', '#B3E5FC', '#B3E5B3', '#FFD4B3', '#E1B3FF', '#FFB3E1',
  '#FFA8A8', '#81D4FA', '#81D481', '#FFB380', '#CD81FF', '#FF81CD'
];

function initializeApp() {
  checkAuthentication();
  setupLoginForm();
}

function checkAuthentication() {
  const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
  const loginView = document.getElementById('login-view');
  const mainView = document.getElementById('main-view');
  
  if (isAuthenticated) {
    loginView.style.display = 'none';
    mainView.classList.remove('hidden');
    init();
  } else {
    loginView.style.display = 'flex';
    mainView.classList.add('hidden');
  }
}

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value;

    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem('authenticated', 'true');
      loginError.style.display = 'none';
      checkAuthentication();
    } else {
      loginError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}

async function init() {
  await initSupabase();

  loadCabanas();
  setupEventListeners();
}

async function loadCabanas() {
  cabanas = await getCabanas();
  renderCabanas();
  renderHeatmap();
}

function renderCabanas() {
  const grid = document.getElementById('cabanas-grid');
  grid.innerHTML = '';

  cabanas.forEach(cabana => {
    const card = document.createElement('div');
    card.className = 'cabana-card';
    card.innerHTML = `
      <h3>Cabaña #${cabana.numero}</h3>
      <div class="cabana-info">
        <p><i class="fas fa-door-open"></i> Capacidad: ${cabana.capacidad} personas</p>
        ${cabana.descripcion ? `<p><i class="fas fa-info-circle"></i> ${cabana.descripcion}</p>` : ''}
      </div>
      <div class="cabana-status disponible">Disponible</div>
      <div class="cabana-buttons">
        <button class="btn-ver-calendario">
          <i class="fas fa-calendar-alt"></i> Ver Calendario
        </button>
      </div>
    `;

    card.querySelector('.btn-ver-calendario').addEventListener('click', () => {
      openCalendarView(cabana);
    });

    grid.appendChild(card);
  });
}

async function renderHeatmap() {
  const heatmapContainer = document.getElementById('ocupacion-heatmap');
  const labelsContainer = document.getElementById('ocupacion-labels');
  const mesContainer = document.getElementById('ocupacion-mes');

  const year = currentYear;
  const month = currentMonth;
  const today = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();

  mesContainer.textContent = `${getMonthYear(year, month)}`;

  heatmapContainer.innerHTML = '';
  labelsContainer.innerHTML = '';

  const allDiasReserva = {};

  for (let cabana of cabanas) {
    const reservas = await getReservasByMonth(cabana.id, year, month);
    const diasReserva = {};

    for (let reserva of reservas) {
      const dias = await getDiasReserva(reserva.id);
      dias.forEach(dia => {
        diasReserva[dia.fecha] = {
          ...dia,
          cliente_nombre: reserva.cliente_nombre
        };
      });
    }

    allDiasReserva[cabana.id] = diasReserva;
  }

  for (let i = 1; i <= 6; i++) {
    const label = document.createElement('div');
    label.className = 'label-cabana-item';
    label.textContent = `Cabaña ${i}`;
    labelsContainer.appendChild(label);

    const row = document.createElement('div');
    row.className = 'heatmap-row';

    const cabana = cabanas.find(c => c.numero === i);

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.textContent = day;

      const dateStr = formatDateISO(new Date(year, month - 1, day));

      let clienteName = null;
      let backgroundColor = null;

      if (cabana && allDiasReserva[cabana.id] && allDiasReserva[cabana.id][dateStr]) {
        const dia = allDiasReserva[cabana.id][dateStr];
        clienteName = dia.cliente_nombre || 'Cliente Desconocido';
        
        if (!clienteColores[clienteName]) {
          const colorIndex = Object.keys(clienteColores).length % paletaColores.length;
          clienteColores[clienteName] = paletaColores[colorIndex];
        }
        
        backgroundColor = clienteColores[clienteName];
        cell.style.backgroundColor = backgroundColor;
        cell.style.borderColor = '#555';
        cell.style.borderWidth = '2px';
      }

      const tooltip = clienteName ? `${clienteName}` : `Día ${day}: Disponible`;
      cell.setAttribute('data-tooltip', tooltip);

      if (today.getDate() === day && today.getMonth() === month - 1 && today.getFullYear() === year) {
        cell.classList.add('hoy');
      }

      row.appendChild(cell);
    }

    heatmapContainer.appendChild(row);
  }
}

async function openCalendarView(cabana) {
  currentCabana = cabana;
  selectedDays = {};
  lastSelectedDate = null;
  reservaColorMap = {};
  
  displayDate = new Date();

  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('calendar-view').classList.remove('hidden');

  document.getElementById('cabana-nombre').textContent = `Cabaña #${cabana.numero}`;

  updateCalendarTitle();

  await loadCalendar();
}

async function loadCalendar() {
  if (!currentCabana) return;

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth() + 1;

  allReservas = await getReservasByMonth(currentCabana.id, year, month);

  allDiasReserva = [];
  for (let reserva of allReservas) {
    const dias = await getDiasReserva(reserva.id);
    allDiasReserva = allDiasReserva.concat(dias);
  }

  generateCalendar(year, month, allReservas, allDiasReserva);
  updateCalendarTitle();
}

function goBackToMain() {
  document.getElementById('calendar-view').classList.add('hidden');
  document.getElementById('main-view').classList.remove('hidden');

  selectedDays = {};
  currentCabana = null;
  lastSelectedDate = null;
}

function previousMonth() {
  if (currentMonth === 1) {
    currentMonth = 12;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderHeatmap();
}

function nextMonth_OLD() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendarTitle();
  loadCalendar();
}

function nextMonth() {
  if (currentMonth === 12) {
    currentMonth = 1;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderHeatmap();
}

function openEditCabanaModal(cabana) {
  const modal = document.getElementById('edit-cabana-modal');
  if (!modal) {
    alert('Modal de edición de cabaña no encontrado');
    return;
  }
  document.getElementById('edit-cabana-numero').value = cabana.numero;
  document.getElementById('edit-cabana-capacidad').value = cabana.capacidad;
  document.getElementById('edit-cabana-precio').value = cabana.precio_base;
  document.getElementById('edit-cabana-descripcion').value = cabana.descripcion || '';
  document.getElementById('edit-cabana-id').value = cabana.id;
  modal.classList.remove('hidden');
}

function closeEditCabanaModal() {
  const modal = document.getElementById('edit-cabana-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function handleEditCabanaSubmit(e) {
  e.preventDefault();
  
  const cabanaId = document.getElementById('edit-cabana-id').value;
  const capacidad = parseInt(document.getElementById('edit-cabana-capacidad').value);
  const precio_base = parseFloat(document.getElementById('edit-cabana-precio').value);
  const descripcion = document.getElementById('edit-cabana-descripcion').value;

  if (!cabanaId) {
    alert('Error: ID de cabaña no encontrado');
    return;
  }

  if (isNaN(capacidad) || capacidad < 1) {
    alert('Error: Capacidad debe ser un número positivo');
    return;
  }

  if (isNaN(precio_base) || precio_base < 0) {
    alert('Error: Precio debe ser un número válido');
    return;
  }

  try {
    const result = await updateCabana(cabanaId, {
      capacidad,
      precio_base,
      descripcion
    });

    if (!result) {
      alert('Error: No se recibió respuesta del servidor');
      return;
    }

    alert('Cabaña actualizada correctamente');
    closeEditCabanaModal();
    
    await loadCabanas();
    renderCabanas();
  } catch (error) {
    console.error('Error al actualizar cabaña:', error);
    alert('Error al actualizar la cabaña: ' + error.message);
  }
}

function setupTabSwitching() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  
  if (tabId === 'tab-notas') {
    renderNotasTab();
  } else if (tabId === 'tab-pagos') {
    renderPagosTab();
  }
}

async function openClientesView() {
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('clientes-view').classList.remove('hidden');
  await renderClientesList();
}

function goBackFromClientes() {
  document.getElementById('clientes-view').classList.add('hidden');
  document.getElementById('main-view').classList.remove('hidden');
}

async function handleExportClientes() {
  try {
    const clientes = await getAllClientes();
    if (clientes.length === 0) {
      showToast('No hay clientes para exportar', 'warning');
      return;
    }
    exportClientsToExcel(clientes);
    showToast('Clientes exportados exitosamente', 'success');
  } catch (error) {
    console.error('Error exporting clients:', error);
    showToast('Error al exportar clientes', 'error');
  }
}

async function renderNotasTab() {
  try {
    const reservas = await getAllReservas();
    const clientesConReservas = await getClientesWithReservas();
    
    const notasList = document.getElementById('notas-list');
    
    if (!reservas || reservas.length === 0) {
      notasList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay reservas con notas</p>';
      return;
    }

    let html = '';
    
    reservas.forEach(reserva => {
      if (reserva.notas && reserva.notas.trim()) {
        const entrada = new Date(reserva.fecha_inicio).toLocaleDateString('es-AR');
        const salida = new Date(reserva.fecha_fin).toLocaleDateString('es-AR');
        const cabin = `Cabaña #${reserva.cabana_id ? reserva.cabana_id.slice(0, 1) : '?'}`;
        const isCompleted = reserva.nota_completada ? 'checked' : '';
        
        html += '<div class="nota-section">';
        html += '<div class="nota-header">';
        html += `<h3>${reserva.cliente_nombre}</h3>`;
        html += `<p class="nota-periodo"><i class="fas fa-calendar"></i> ${entrada} - ${salida}</p>`;
        html += '</div>';
        
        html += '<div class="nota-item">';
        html += `<span class="nota-cabin">${cabin}</span>`;
        html += '<div class="nota-content">';
        html += '<div class="nota-text">';
        html += `<p>${reserva.notas}</p>`;
        html += '</div>';
        html += '<div class="nota-checkbox">';
        html += `<input type="checkbox" id="nota-check-${reserva.id}" data-reserva-id="${reserva.id}" ${isCompleted}>`;
        html += `<label for="nota-check-${reserva.id}">Completada</label>`;
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      }
    });
    
    if (html === '') {
      notasList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay reservas con notas registradas</p>';
      return;
    }

    notasList.innerHTML = html;
    
    document.querySelectorAll('input[type="checkbox"][data-reserva-id]').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const reservaId = e.target.getAttribute('data-reserva-id');
        await updateNotaCompletion(reservaId, e.target.checked);
      });
    });
  } catch (error) {
    console.error('Error rendering notas tab:', error);
  }
}

let mostrarPagosCompletados = false;

async function renderPagosTab() {
  try {
    const reservas = await getAllReservas();
    
    const pagosList = document.getElementById('pagos-list');
    
    if (!reservas || reservas.length === 0) {
      pagosList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay reservas</p>';
      return;
    }

    let pagosCompletados = [];
    let pagosIncompletos = [];
    
    reservas.forEach(reserva => {
      if (reserva.estado_pago === 'pagado') {
        pagosCompletados.push(reserva);
      } else if (reserva.estado_pago === 'parcial' || reserva.estado_pago === 'pendiente') {
        pagosIncompletos.push(reserva);
      }
    });

    let html = '<div class="pagos-buscador-container">';
    html += '<div class="pagos-search-wrapper">';
    html += '<input type="text" id="pagos-search-input" class="pagos-search-input" placeholder="Buscar cliente..."><i class="fas fa-search"></i>';
    html += '</div>';
    html += '<button id="btn-toggle-pagos-completados" class="btn btn-outline pagos-toggle-btn">';
    html += `<i class="fas fa-${mostrarPagosCompletados ? 'eye-slash' : 'eye'}"></i> ${mostrarPagosCompletados ? 'Ocultar' : 'Ver'} Pagos Realizados (${pagosCompletados.length})`;
    html += '</button>';
    html += '</div>';
    
    html += '<div class="pagos-layout-container">';
    
    if (mostrarPagosCompletados) {
      html += '<div class="pagos-columna pagos-completados">';
      html += '<h3 class="pagos-columna-titulo"><i class="fas fa-check-circle"></i> Pagos Completados</h3>';
      
      if (pagosCompletados.length === 0) {
        html += '<p style="text-align: center; color: #999; padding: 20px;">No hay pagos completados</p>';
      } else {
        pagosCompletados.forEach(reserva => {
          const entrada = new Date(reserva.fecha_inicio).toLocaleDateString('es-AR');
          const salida = new Date(reserva.fecha_fin).toLocaleDateString('es-AR');
          const cabin = `Cabaña #${reserva.cabana_id ? reserva.cabana_id.slice(0, 1) : '?'}`;
          
          html += '<div class="pago-card pago-card-completado">';
          html += '<div class="pago-card-header">';
          html += `<h4>${reserva.cliente_nombre}</h4>`;
          html += `<span class="pago-estado-badge pagado"><i class="fas fa-check"></i> Pagado</span>`;
          html += '</div>';
          html += `<p class="pago-card-info"><i class="fas fa-phone"></i> ${reserva.cliente_telefono}</p>`;
          html += `<p class="pago-card-info"><i class="fas fa-calendar"></i> ${entrada} - ${salida}</p>`;
          html += `<p class="pago-card-info"><i class="fas fa-home"></i> ${cabin}</p>`;
          html += '<div class="pago-card-monto">';
          html += `<span class="pago-label">Total Pagado:</span>`;
          html += `<span class="pago-valor">$${(reserva.monto_total || 0).toFixed(2)}</span>`;
          html += '</div>';
          html += '</div>';
        });
      }
      
      html += '</div>';
    }
    
    html += '<div class="pagos-columna pagos-incompletos">';
    html += '<h3 class="pagos-columna-titulo"><i class="fas fa-exclamation-circle"></i> Pagos Pendientes</h3>';
    
    if (pagosIncompletos.length === 0) {
      html += '<p style="text-align: center; color: #999; padding: 20px;">Todos los pagos están al día</p>';
    } else {
      pagosIncompletos.forEach(reserva => {
        const deuda = (reserva.monto_total || 0) - (reserva.monto_pagado || 0);
        const entrada = new Date(reserva.fecha_inicio).toLocaleDateString('es-AR');
        const salida = new Date(reserva.fecha_fin).toLocaleDateString('es-AR');
        const cabin = `Cabaña #${reserva.cabana_id ? reserva.cabana_id.slice(0, 1) : '?'}`;
        const estadoColor = reserva.estado_pago === 'parcial' ? 'parcial' : 'pendiente';
        
        html += `<div class="pago-card pago-card-${estadoColor}" data-cliente="${reserva.cliente_nombre.toLowerCase()}">`;
        html += '<div class="pago-card-header">';
        html += `<h4>${reserva.cliente_nombre}</h4>`;
        html += `<span class="pago-estado-badge ${estadoColor}"><i class="fas fa-${estadoColor === 'parcial' ? 'circle-half' : 'times-circle'}"></i> ${estadoColor.charAt(0).toUpperCase() + estadoColor.slice(1)}</span>`;
        html += '</div>';
        html += `<p class="pago-card-info"><i class="fas fa-phone"></i> ${reserva.cliente_telefono}</p>`;
        html += `<p class="pago-card-info"><i class="fas fa-calendar"></i> ${entrada} - ${salida}</p>`;
        html += `<p class="pago-card-info"><i class="fas fa-home"></i> ${cabin}</p>`;
        html += '<div class="pago-card-montos">';
        html += '<div class="pago-monto-item">';
        html += '<span class="pago-label">Total:</span>';
        html += `<span class="pago-valor">$${(reserva.monto_total || 0).toFixed(2)}</span>`;
        html += '</div>';
        html += '<div class="pago-monto-item">';
        html += '<span class="pago-label">Pagado:</span>';
        html += `<span class="pago-valor">$${(reserva.monto_pagado || 0).toFixed(2)}</span>`;
        html += '</div>';
        html += '<div class="pago-monto-item deuda">';
        html += '<span class="pago-label">Deuda:</span>';
        html += `<span class="pago-valor">$${deuda.toFixed(2)}</span>`;
        html += '</div>';
        html += '</div>';
        html += '<div class="pago-card-botones">';
        html += `<button class="pago-btn-parcial" data-reserva-id="${reserva.id}" data-cliente="${reserva.cliente_nombre}" data-monto-total="${reserva.monto_total}" data-monto-pagado="${reserva.monto_pagado || 0}">`;
        html += '<i class="fas fa-plus"></i> Pago Parcial';
        html += '</button>';
        html += `<button class="pago-btn-completar" data-reserva-id="${reserva.id}" data-monto="${reserva.monto_total}">`;
        html += '<i class="fas fa-check"></i> Pagado Completo';
        html += '</button>';
        html += '</div>';
        html += '</div>';
      });
    }
    
    html += '</div>';
    html += '</div>';

    pagosList.innerHTML = html;
    
    document.getElementById('btn-toggle-pagos-completados').addEventListener('click', async () => {
      mostrarPagosCompletados = !mostrarPagosCompletados;
      await renderPagosTab();
    });
    
    document.getElementById('pagos-search-input').addEventListener('keyup', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.pago-card-pendiente, .pago-card-parcial').forEach(card => {
        const cliente = card.getAttribute('data-cliente');
        if (cliente.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
    
    document.querySelectorAll('.pago-btn-parcial').forEach(button => {
      button.addEventListener('click', (e) => {
        const reservaId = e.currentTarget.getAttribute('data-reserva-id');
        const cliente = e.currentTarget.getAttribute('data-cliente');
        const montoTotal = parseFloat(e.currentTarget.getAttribute('data-monto-total'));
        const montoPagado = parseFloat(e.currentTarget.getAttribute('data-monto-pagado'));
        
        openPagoParcialModal(reservaId, cliente, montoTotal, montoPagado);
      });
    });
    
    document.querySelectorAll('.pago-btn-completar').forEach(button => {
      button.addEventListener('click', async (e) => {
        const reservaId = e.currentTarget.getAttribute('data-reserva-id');
        const monto = e.currentTarget.getAttribute('data-monto');
        await updatePaymentStatus(reservaId, 'pagado', monto);
        await renderPagosTab();
      });
    });
  } catch (error) {
    console.error('Error rendering pagos tab:', error);
  }
}

function openPagoParcialModal(reservaId, cliente, montoTotal, montoPagado) {
  document.getElementById('pago-cliente-nombre').value = cliente;
  document.getElementById('pago-monto-total').value = montoTotal.toFixed(2);
  document.getElementById('pago-monto-pagado').value = montoPagado.toFixed(2);
  document.getElementById('pago-deuda-actual').value = (montoTotal - montoPagado).toFixed(2);
  document.getElementById('pago-monto-nuevo').value = '';
  document.getElementById('pago-monto-nuevo').focus();
  
  document.getElementById('form-pago-parcial').onsubmit = async (e) => {
    e.preventDefault();
    
    const montoNuevo = parseFloat(document.getElementById('pago-monto-nuevo').value);
    const deudaActual = montoTotal - montoPagado;
    
    if (isNaN(montoNuevo) || montoNuevo <= 0) {
      showToast('Ingresa un monto válido', 'warning');
      return;
    }
    
    if (montoNuevo > deudaActual) {
      showToast(`El monto no puede ser mayor a la deuda ($${deudaActual.toFixed(2)})`, 'warning');
      return;
    }
    
    const nuevoMontoPagado = montoPagado + montoNuevo;
    const nuevoEstado = nuevoMontoPagado >= montoTotal ? 'pagado' : 'parcial';
    
    await updatePaymentStatus(reservaId, nuevoEstado, nuevoMontoPagado);
    closePagoParcialModal();
    await renderPagosTab();
  };
  
  document.getElementById('modal-pago-parcial').classList.remove('hidden');
}

function closePagoParcialModal() {
  document.getElementById('modal-pago-parcial').classList.add('hidden');
  document.getElementById('form-pago-parcial').reset();
}

async function renderClientesList() {
  try {
    const clientesConReservas = await getClientesWithReservas();
    const clientesList = document.getElementById('clientes-list');
    
    if (clientesConReservas.length === 0) {
      clientesList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay clientes registrados</p>';
      return;
    }

    let html = '';

    clientesConReservas.forEach(cliente => {
      const fechaRegistro = new Date(cliente.created_at).toLocaleDateString('es-AR');
      html += '<div class="cliente-section">';
      html += '<div class="cliente-header">';
      html += `<h3>${cliente.nombre}</h3>`;
      html += `<p class="cliente-phone"><i class="fas fa-phone"></i> ${cliente.telefono}</p>`;
      html += `<p class="cliente-date"><i class="fas fa-calendar"></i> Registrado: ${fechaRegistro}</p>`;
      html += '</div>';
      
      if (cliente.reservas && cliente.reservas.length > 0) {
        html += '<div class="cliente-reservas">';
        html += '<h4>Reservas</h4>';
        html += '<div class="reservas-list">';
        
        cliente.reservas.forEach(reserva => {
          const entrada = new Date(reserva.fecha_inicio).toLocaleDateString('es-AR');
          const salida = new Date(reserva.fecha_fin).toLocaleDateString('es-AR');
          const cabin = `Cabaña #${reserva.cabana_id ? reserva.cabana_id.slice(0, 1) : '?'}`;
          
          html += '<div class="reserva-item">';
          html += `<span class="reserva-cabin">${cabin}</span>`;
          html += `<span class="reserva-dates">`;
          html += `<i class="fas fa-sign-in-alt"></i> ${entrada}`;
          html += ` <i class="fas fa-sign-out-alt"></i> ${salida}`;
          html += `</span>`;
          html += `<span class="reserva-personas">${reserva.cantidad_personas} ${reserva.cantidad_personas === 1 ? 'persona' : 'personas'}</span>`;
          html += '</div>';
        });
        
        html += '</div></div>';
      } else {
        html += '<div class="sin-reservas">Sin reservas</div>';
      }
      
      html += '</div>';
    });

    clientesList.innerHTML = html;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    alert('Error al cargar la lista de clientes');
  }
}

function setupEventListeners() {
  document.getElementById('btn-volver').addEventListener('click', goBackToMain);
  document.getElementById('btn-prev-mes').addEventListener('click', previousMonth);
  document.getElementById('btn-next-mes').addEventListener('click', nextMonth);
  document.getElementById('btn-prev-mes-calendar').addEventListener('click', previousMonthCalendar);
  document.getElementById('btn-next-mes-calendar').addEventListener('click', nextMonthCalendar);
  document.getElementById('btn-ver-clientes').addEventListener('click', openClientesView);
  document.getElementById('btn-volver-clientes').addEventListener('click', goBackFromClientes);
  document.getElementById('btn-export-clientes').addEventListener('click', handleExportClientes);
  document.getElementById('btn-add-reserva').addEventListener('click', openAddReservaModal);
  document.getElementById('btn-close-pago-modal').addEventListener('click', closePagoParcialModal);
  document.getElementById('btn-cancel-pago-modal').addEventListener('click', closePagoParcialModal);
  
  setupTabSwitching();

  document.getElementById('btn-close-modal').addEventListener('click', closeAddReservaModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeAddReservaModal);
  document.getElementById('form-reserva').addEventListener('submit', handleFormSubmit);

  document.getElementById('btn-close-edit-modal').addEventListener('click', closeEditReservaModal);
  document.getElementById('btn-cancel-edit-modal').addEventListener('click', closeEditReservaModal);
  document.getElementById('form-edit-reserva').addEventListener('submit', handleEditFormSubmit);
  document.getElementById('btn-delete-reserva').addEventListener('click', handleDeleteReserva);

  document.getElementById('form-edit-cabana').addEventListener('submit', handleEditCabanaSubmit);

  document.getElementById('fecha-inicio').addEventListener('change', () => {
    updateSelectedDaysFromDates();
  });

  document.getElementById('fecha-fin').addEventListener('change', () => {
    updateSelectedDaysFromDates();
  });

  document.getElementById('edit-fecha-inicio').addEventListener('change', () => {
    updateEditSelectedDaysFromDates();
  });

  document.getElementById('edit-fecha-fin').addEventListener('change', () => {
    updateEditSelectedDaysFromDates();
  });
}

function updateSelectedDaysFromDates() {
  const fechaInicio = document.getElementById('fecha-inicio').value;
  const fechaFin = document.getElementById('fecha-fin').value;

  if (!fechaInicio || !fechaFin) return;

  const startDate = parseDateISO(fechaInicio);
  const endDate = parseDateISO(fechaFin);

  if (startDate > endDate) {
    showToast('La fecha de inicio debe ser menor que la fecha de fin', 'warning');
    return;
  }

  selectedDays = {};
  const daysBetween = getDaysBetween(startDate, endDate);

  daysBetween.forEach((date) => {
    const dateISO = formatDateISO(date);
    selectedDays[dateISO] = { am: true, pm: true };
  });

  updateOcupacionDiasUI();
  updateCalendarSelection();
}

function updateEditSelectedDaysFromDates() {
  const fechaInicio = document.getElementById('edit-fecha-inicio').value;
  const fechaFin = document.getElementById('edit-fecha-fin').value;

  if (!fechaInicio || !fechaFin) return;

  const startDate = parseDateISO(fechaInicio);
  const endDate = parseDateISO(fechaFin);

  if (startDate > endDate) {
    showToast('La fecha de inicio debe ser menor que la fecha de fin', 'warning');
    return;
  }

  selectedDays = {};
  const daysBetween = getDaysBetween(startDate, endDate);

  daysBetween.forEach((date) => {
    const dateISO = formatDateISO(date);
    selectedDays[dateISO] = { am: true, pm: true };
  });

  const diasReserva = allDiasReserva.filter(d => d.reserva_id === currentEditingReservaId);
  diasReserva.forEach(dia => {
    if (selectedDays[dia.fecha]) {
      selectedDays[dia.fecha] = {
        am: dia.ocupacion_am,
        pm: dia.ocupacion_pm
      };
    }
  });

  populateEditOcupacionDias(diasReserva);
}

function updateCalendarSelection() {
  document.querySelectorAll('.dia.selected').forEach(el => {
    el.classList.remove('selected');
  });

  const daysBetween = getDaysBetween(
    parseDateISO(document.getElementById('fecha-inicio').value),
    parseDateISO(document.getElementById('fecha-fin').value)
  );

  daysBetween.forEach(date => {
    const dateISO = formatDateISO(date);
    const dayElement = document.querySelector(`[data-fecha="${dateISO}"]`);
    if (dayElement) {
      dayElement.classList.add('selected');
    }
  });
}

async function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.addEventListener('load', async () => {
  try {
    await loadSupabaseScript();
    initializeApp();
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Error al inicializar la aplicación. Verifica la consola.', 'error');
  }
});

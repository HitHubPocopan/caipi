let cabanas = [];
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
        <p><i class="fas fa-dollar-sign"></i> $${cabana.precio_base}/noche</p>
        ${cabana.descripcion ? `<p><i class="fas fa-info-circle"></i> ${cabana.descripcion}</p>` : ''}
      </div>
      <div class="cabana-status disponible">Disponible</div>
      <div class="cabana-buttons">
        <button class="btn-editar-cabana">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-ver-calendario">
          <i class="fas fa-calendar-alt"></i> Ver Calendario
        </button>
      </div>
    `;

    card.querySelector('.btn-editar-cabana').addEventListener('click', () => {
      openEditCabanaModal(cabana);
    });

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

  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('calendar-view').classList.remove('hidden');

  document.getElementById('cabana-nombre').textContent = `Cabaña #${cabana.numero}`;

  currentDate = new Date();
  updateCalendarTitle();

  await loadCalendar();
}

async function loadCalendar() {
  if (!currentCabana) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  allReservas = await getReservasByMonth(currentCabana.id, year, month);

  allDiasReserva = [];
  for (let reserva of allReservas) {
    const dias = await getDiasReserva(reserva.id);
    allDiasReserva = allDiasReserva.concat(dias);
  }

  generateCalendar(year, month, allReservas, allDiasReserva);
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

  try {
    await updateCabana(cabanaId, {
      capacidad,
      precio_base,
      descripcion
    });

    alert('Cabaña actualizada correctamente');
    closeEditCabanaModal();
    
    await loadCabanas();
    renderCabanas();
  } catch (error) {
    console.error('Error al actualizar cabaña:', error);
    alert('Error al actualizar la cabaña: ' + error.message);
  }
}

function setupEventListeners() {
  document.getElementById('btn-volver').addEventListener('click', goBackToMain);
  document.getElementById('btn-prev-mes').addEventListener('click', previousMonth);
  document.getElementById('btn-next-mes').addEventListener('click', nextMonth);
  document.getElementById('btn-add-reserva').addEventListener('click', openAddReservaModal);

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
  
  // Agregar +1 día para el checkout (sistema de noches alquiladas)
  const checkoutDate = new Date(endDate);
  checkoutDate.setDate(checkoutDate.getDate() + 1);
  daysBetween.push(new Date(checkoutDate));

  daysBetween.forEach((date, index) => {
    const dateISO = formatDateISO(date);
    // Último día (checkout) solo AM
    if (index === daysBetween.length - 1) {
      selectedDays[dateISO] = { am: true, pm: false };
    } else {
      // Primer día solo PM (check-in 11 AM)
      if (index === 0) {
        selectedDays[dateISO] = { am: false, pm: true };
      } else {
        // Días intermedios completos
        selectedDays[dateISO] = { am: true, pm: true };
      }
    }
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
  
  // Agregar +1 día para el checkout (sistema de noches alquiladas)
  const checkoutDate = new Date(endDate);
  checkoutDate.setDate(checkoutDate.getDate() + 1);
  daysBetween.push(new Date(checkoutDate));

  daysBetween.forEach((date, index) => {
    const dateISO = formatDateISO(date);
    // Último día (checkout) solo AM
    if (index === daysBetween.length - 1) {
      selectedDays[dateISO] = { am: true, pm: false };
    } else {
      // Primer día solo PM (check-in 11 AM)
      if (index === 0) {
        selectedDays[dateISO] = { am: false, pm: true };
      } else {
        // Días intermedios completos
        selectedDays[dateISO] = { am: true, pm: true };
      }
    }
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
    await init();
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Error al inicializar la aplicación. Verifica la consola.', 'error');
  }
});

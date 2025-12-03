let currentDate = new Date();
let displayDate = new Date();
let selectedDays = {};
let currentCabana = null;

function generateCalendar(year, month, reservas, diasReserva) {
  const calendarGrid = document.getElementById('calendar-grid');
  calendarGrid.innerHTML = '';

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dayElement = createEmptyDayElement();
    calendarGrid.appendChild(dayElement);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
  const todayDate = today.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateISO(new Date(year, month - 1, day));
    const dayElement = createDayElement(day, dateStr, reservas, diasReserva, year, month);

    if (isCurrentMonth && day === todayDate) {
      dayElement.classList.add('today');
    }

    if (selectedDays[dateStr]) {
      dayElement.classList.add('selected');
    }

    calendarGrid.appendChild(dayElement);
  }

  const totalCells = calendarGrid.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const dayElement = createEmptyDayElement();
    calendarGrid.appendChild(dayElement);
  }
}

function createDayElement(day, dateStr, reservas, diasReserva, year, month) {
  const dayElement = document.createElement('div');
  dayElement.className = 'dia';
  dayElement.dataset.fecha = dateStr;
  dayElement.dataset.day = day;

  const dayNumeroDiv = document.createElement('div');
  dayNumeroDiv.className = 'dia-numero';
  dayNumeroDiv.textContent = day;
  dayElement.appendChild(dayNumeroDiv);

  const dayClienteDiv = document.createElement('div');
  dayClienteDiv.className = 'dia-cliente';

  let hasOccupation = false;
  let clientName = '';
  let amOccupied = false;
  let pmOccupied = false;
  let reservaId = null;

  for (let dia of diasReserva) {
    if (dia.fecha === dateStr) {
      if (dia.ocupacion_am) amOccupied = true;
      if (dia.ocupacion_pm) pmOccupied = true;

      for (let reserva of reservas) {
        if (reserva.id === dia.reserva_id) {
          clientName = abbreviateName(reserva.cliente_nombre);
          reservaId = dia.reserva_id;
          hasOccupation = true;
          break;
        }
      }
    }
  }

  if (hasOccupation) {
    if (amOccupied && pmOccupied) {
      dayElement.classList.add('ocupado-completo');
    } else if (amOccupied && !pmOccupied) {
      dayElement.classList.add('ocupado-am');
    } else if (!amOccupied && pmOccupied) {
      dayElement.classList.add('ocupado-pm');
    }

    const colorClass = getReservaColorClass(reservaId);
    dayElement.classList.add(colorClass);

    dayClienteDiv.textContent = clientName;
    dayElement.dataset.reservaId = reservaId;
  }

  dayElement.appendChild(dayClienteDiv);

  dayElement.addEventListener('click', (e) => {
    if (e.shiftKey) {
      selectRangeOfDays(dateStr);
    } else if (hasOccupation && reservaId) {
      openEditReservaModal(reservaId);
    } else {
      toggleDaySelection(dateStr);
    }
  });

  dayElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  return dayElement;
}

function createEmptyDayElement() {
  const dayElement = document.createElement('div');
  dayElement.className = 'dia vacio';
  return dayElement;
}

function toggleDaySelection(dateStr) {
  if (selectedDays[dateStr]) {
    delete selectedDays[dateStr];
  } else {
    selectedDays[dateStr] = { am: true, pm: true };
  }

  const dayElement = document.querySelector(`[data-fecha="${dateStr}"]`);
  if (dayElement) {
    dayElement.classList.toggle('selected');
  }

  updateOcupacionDiasUI();
}

let lastSelectedDate = null;

function selectRangeOfDays(dateStr) {
  if (!lastSelectedDate) {
    lastSelectedDate = dateStr;
    toggleDaySelection(dateStr);
    return;
  }

  const date1 = parseDateISO(lastSelectedDate);
  const date2 = parseDateISO(dateStr);

  const start = date1 <= date2 ? date1 : date2;
  const end = date1 <= date2 ? date2 : date1;

  const rangeDays = getDaysBetween(start, end);

  selectedDays = {};
  rangeDays.forEach((date) => {
    const dateISO = formatDateISO(date);
    selectedDays[dateISO] = { am: true, pm: true };
  });

  document.querySelectorAll('.dia.selected').forEach(el => {
    el.classList.remove('selected');
  });

  rangeDays.forEach(date => {
    const dateISO = formatDateISO(date);
    const dayElement = document.querySelector(`[data-fecha="${dateISO}"]`);
    if (dayElement) {
      dayElement.classList.add('selected');
    }
  });

  updateOcupacionDiasUI();
  lastSelectedDate = null;
}

function getDaysBetween(start, end) {
  const days = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function updateOcupacionDiasUI() {
  const ocupacionContainer = document.getElementById('ocupacion-dias');
  ocupacionContainer.innerHTML = '';

  const sortedDates = Object.keys(selectedDays).sort();

  if (sortedDates.length === 0) {
    ocupacionContainer.innerHTML = '<p style="color: #999; font-size: 0.9rem;">Selecciona días en el calendario</p>';
    return;
  }

  sortedDates.forEach((dateStr) => {
    const date = parseDateISO(dateStr);
    const dateDisplay = formatDateDisplay(date);

    const diaDiv = document.createElement('div');
    diaDiv.className = 'dia-ocupacion';

    diaDiv.innerHTML = `
      <span class="dia-ocupacion-fecha">${dateDisplay}</span>
      <span style="color: #2196F3; font-weight: 600; font-size: 0.9rem;">Reservado</span>
    `;

    ocupacionContainer.appendChild(diaDiv);
  });
}

function getReservaColorClass(reservaId) {
  if (!reservaId) return 'reserva-color-1';
  const colors = ['reserva-color-1', 'reserva-color-2', 'reserva-color-3', 'reserva-color-4', 'reserva-color-5', 'reserva-color-6'];
  let hash = 0;
  for (let i = 0; i < reservaId.length; i++) {
    hash = ((hash << 5) - hash) + reservaId.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function abbreviateName(name) {
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return parts[0].charAt(0).toUpperCase() + '. ' + parts[parts.length - 1];
  }
  return name.substring(0, 10);
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateISO(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(date) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function parseDate(dateStr) {
  return new Date(dateStr);
}

function getMonthYear(year, month) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${months[month - 1]} ${year}`;
}

function previousMonthCalendar() {
  displayDate.setMonth(displayDate.getMonth() - 1);
  loadCalendar();
}

function nextMonthCalendar() {
  displayDate.setMonth(displayDate.getMonth() + 1);
  loadCalendar();
}

function updateCalendarTitle() {
  const mesAnio = getMonthYear(displayDate.getFullYear(), displayDate.getMonth() + 1);
  const currentMesElement = document.getElementById('current-mes-anio');
  const mesElement = document.getElementById('mes-anio');
  
  if (currentMesElement) {
    currentMesElement.textContent = mesAnio;
  }
  if (mesElement) {
    mesElement.textContent = mesAnio;
  }
}

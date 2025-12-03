let currentDate = new Date();
let calendarMonthOffset = 0;
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
    selectedDays[dateStr] = { am: false, pm: false };
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
  
  // Agregar +1 día para el checkout (sistema de noches alquiladas)
  const checkoutDate = new Date(end);
  checkoutDate.setDate(checkoutDate.getDate() + 1);
  rangeDays.push(new Date(checkoutDate));

  selectedDays = {};
  rangeDays.forEach((date, index) => {
    const dateISO = formatDateISO(date);
    // Último día (checkout) solo AM
    if (index === rangeDays.length - 1) {
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

  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];
  const hasMultipleDays = sortedDates.length > 1;

  sortedDates.forEach((dateStr, index) => {
    const date = parseDateISO(dateStr);
    const dateDisplay = formatDateDisplay(date);
    const isFirstDay = dateStr === firstDate;
    const isLastDay = dateStr === lastDate;
    const isSingleDay = sortedDates.length === 1;

    const diaDiv = document.createElement('div');
    diaDiv.className = 'dia-ocupacion';

    if (isSingleDay || isFirstDay || isLastDay) {
      let dayLabel = '';
      let description = '';
      if (isSingleDay) {
        dayLabel = '(Noche única)';
        description = 'Check-in: 11 AM | Check-out: 9 AM +1 día';
      } else if (isFirstDay) {
        dayLabel = '(Check-in: 11 AM)';
        description = '';
      } else if (isLastDay) {
        dayLabel = '(Check-out: 9 AM)';
        description = '';
      }

      diaDiv.innerHTML = `
        <span class="dia-ocupacion-fecha">${dateDisplay} <small>${dayLabel}</small></span>
        ${description ? `<small style="color: #999; font-size: 0.8rem;">${description}</small>` : ''}
        <div class="dia-ocupacion-botones">
          <button type="button" class="ocupacion-btn" data-fecha="${dateStr}" data-type="am">AM</button>
          <button type="button" class="ocupacion-btn" data-fecha="${dateStr}" data-type="completo">Día Completo</button>
          <button type="button" class="ocupacion-btn" data-fecha="${dateStr}" data-type="pm">PM</button>
        </div>
      `;

      const amBtn = diaDiv.querySelector('[data-type="am"]');
      const completoBtn = diaDiv.querySelector('[data-type="completo"]');
      const pmBtn = diaDiv.querySelector('[data-type="pm"]');

      const { am, pm } = selectedDays[dateStr];

      if (am && pm) {
        completoBtn.classList.add('active');
      } else if (am && !pm) {
        amBtn.classList.add('active');
      } else if (!am && pm) {
        pmBtn.classList.add('active');
      }

      amBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedDays[dateStr] = { am: true, pm: false };
        updateOcupacionDiasUI();
      });

      completoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedDays[dateStr] = { am: true, pm: true };
        updateOcupacionDiasUI();
      });

      pmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedDays[dateStr] = { am: false, pm: true };
        updateOcupacionDiasUI();
      });
    } else {
      diaDiv.innerHTML = `
        <span class="dia-ocupacion-fecha">${dateDisplay}</span>
        <span style="color: #2196F3; font-weight: 600; font-size: 0.9rem;">Ocupado día completo</span>
      `;
    }

    ocupacionContainer.appendChild(diaDiv);
  });
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
  calendarMonthOffset--;
  loadCalendar();
  updateCalendarTitle();
}

function nextMonthCalendar() {
  calendarMonthOffset++;
  loadCalendar();
  updateCalendarTitle();
}

function updateCalendarTitle() {
  const mesAnio = getMonthYear(currentDate.getFullYear(), currentDate.getMonth() + 1);
  const currentMesElement = document.getElementById('current-mes-anio');
  const mesElement = document.getElementById('mes-anio');
  
  if (currentMesElement) {
    currentMesElement.textContent = mesAnio;
  }
  if (mesElement) {
    mesElement.textContent = mesAnio;
  }
}

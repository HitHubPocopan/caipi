let currentEditingReservaId = null;

function openAddReservaModal() {
  document.getElementById('form-reserva').reset();
  document.getElementById('modal-titulo').textContent = 'Nueva Reserva';
  selectedDays = {};
  document.getElementById('ocupacion-dias').innerHTML = '<p style="color: #999; font-size: 0.9rem;">Selecciona días en el calendario</p>';
  document.querySelectorAll('.dia.selected').forEach(el => el.classList.remove('selected'));
  currentEditingReservaId = null;
  document.getElementById('modal-reserva').classList.remove('hidden');
}

function closeAddReservaModal() {
  document.getElementById('modal-reserva').classList.add('hidden');
  selectedDays = {};
}

function openEditReservaModal(reservaId) {
  currentEditingReservaId = reservaId;
  loadReservaData(reservaId);
}

async function loadReservaData(reservaId) {
  const reserva = await getReservaById(reservaId);
  if (!reserva) return;

  const diasReserva = await getDiasReserva(reservaId);

  document.getElementById('edit-cliente-nombre').value = reserva.cliente_nombre;
  document.getElementById('edit-cliente-telefono').value = reserva.cliente_telefono;
  document.getElementById('edit-cantidad-personas').value = reserva.cantidad_personas;
  document.getElementById('edit-fecha-inicio').value = reserva.fecha_inicio;
  document.getElementById('edit-fecha-fin').value = reserva.fecha_fin;
  document.getElementById('edit-estado-pago').value = reserva.estado_pago;
  document.getElementById('edit-monto-total').value = reserva.monto_total;
  document.getElementById('edit-monto-pagado').value = reserva.monto_pagado || 0;
  document.getElementById('edit-notas').value = reserva.notas || '';

  selectedDays = {};
  diasReserva.forEach(dia => {
    selectedDays[dia.fecha] = {
      am: dia.ocupacion_am,
      pm: dia.ocupacion_pm
    };
  });

  populateEditOcupacionDias(diasReserva);

  document.getElementById('modal-edit-reserva').classList.remove('hidden');
}

function populateEditOcupacionDias(diasReserva) {
  const container = document.getElementById('edit-ocupacion-dias');
  container.innerHTML = '';

  if (diasReserva.length === 0) {
    container.innerHTML = '<p style="color: #999;">No hay días en esta reserva</p>';
    return;
  }

  const firstDate = diasReserva[0].fecha;
  const lastDate = diasReserva[diasReserva.length - 1].fecha;
  const isSingleDay = diasReserva.length === 1;

  diasReserva.forEach((dia, index) => {
    const dateDisplay = formatDateDisplay(parseDateISO(dia.fecha));
    const isFirstDay = dia.fecha === firstDate;
    const isLastDay = dia.fecha === lastDate;

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
          <button type="button" class="ocupacion-btn" data-fecha="${dia.fecha}" data-type="am">AM</button>
          <button type="button" class="ocupacion-btn" data-fecha="${dia.fecha}" data-type="completo">Día Completo</button>
          <button type="button" class="ocupacion-btn" data-fecha="${dia.fecha}" data-type="pm">PM</button>
        </div>
      `;

      const amBtn = diaDiv.querySelector('[data-type="am"]');
      const completoBtn = diaDiv.querySelector('[data-type="completo"]');
      const pmBtn = diaDiv.querySelector('[data-type="pm"]');

      if (dia.ocupacion_am && dia.ocupacion_pm) {
        completoBtn.classList.add('active');
      } else if (dia.ocupacion_am && !dia.ocupacion_pm) {
        amBtn.classList.add('active');
      } else if (!dia.ocupacion_am && dia.ocupacion_pm) {
        pmBtn.classList.add('active');
      }

      const updateEditDays = () => {
        const fechaInicio = document.getElementById('edit-fecha-inicio').value;
        const fechaFin = document.getElementById('edit-fecha-fin').value;

        const startDate = parseDateISO(fechaInicio);
        const endDate = parseDateISO(fechaFin);

        selectedDays = {};
        const daysBetween = getDaysBetween(startDate, endDate);
        daysBetween.forEach(date => {
          const dateISO = formatDateISO(date);
          selectedDays[dateISO] = { am: false, pm: false };
        });

        diasReserva.forEach(d => {
          if (selectedDays[d.fecha]) {
            selectedDays[d.fecha] = {
              am: d.ocupacion_am,
              pm: d.ocupacion_pm
            };
          }
        });

        populateEditOcupacionDias(diasReserva);
      };

      amBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const fecha = amBtn.dataset.fecha;
        selectedDays[fecha] = { am: true, pm: false };
        updateEditDays();
      });

      completoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const fecha = completoBtn.dataset.fecha;
        selectedDays[fecha] = { am: true, pm: true };
        updateEditDays();
      });

      pmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const fecha = pmBtn.dataset.fecha;
        selectedDays[fecha] = { am: false, pm: true };
        updateEditDays();
      });
    } else {
      diaDiv.innerHTML = `
        <span class="dia-ocupacion-fecha">${dateDisplay}</span>
        <span style="color: #2196F3; font-weight: 600; font-size: 0.9rem;">Ocupado día completo</span>
      `;
    }

    container.appendChild(diaDiv);
  });
}

function closeEditReservaModal() {
  document.getElementById('modal-edit-reserva').classList.add('hidden');
  currentEditingReservaId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const clienteNombre = document.getElementById('cliente-nombre').value.trim();
  const clienteTelefono = document.getElementById('cliente-telefono').value.trim();
  const cantidadPersonas = parseInt(document.getElementById('cantidad-personas').value);
  const fechaInicio = document.getElementById('fecha-inicio').value;
  const fechaFin = document.getElementById('fecha-fin').value;
  const estadoPago = document.getElementById('estado-pago').value;
  const montoTotal = document.getElementById('monto-total').value;
  const montoPagado = document.getElementById('monto-pagado').value;
  const notas = document.getElementById('notas').value.trim();

  if (!clienteNombre || !clienteTelefono || !cantidadPersonas || !fechaInicio || !fechaFin || !montoTotal) {
    showToast('Por favor completa todos los campos requeridos', 'warning');
    return;
  }

  if (Object.keys(selectedDays).length === 0) {
    showToast('Por favor selecciona al menos un día', 'warning');
    return;
  }

  const overlap = await checkOverlap(currentCabana.id, fechaInicio, fechaFin);
  if (overlap) {
    showToast('Esta cabaña ya tiene una reserva en las fechas seleccionadas', 'error');
    return;
  }

  const result = await createReserva(
    currentCabana.id,
    clienteNombre,
    clienteTelefono,
    cantidadPersonas,
    fechaInicio,
    fechaFin,
    estadoPago,
    montoTotal,
    montoPagado,
    notas,
    selectedDays
  );

  if (result) {
    closeAddReservaModal();
    loadCalendar();
  }
}

async function handleEditFormSubmit(e) {
  e.preventDefault();

  const clienteNombre = document.getElementById('edit-cliente-nombre').value.trim();
  const clienteTelefono = document.getElementById('edit-cliente-telefono').value.trim();
  const cantidadPersonas = parseInt(document.getElementById('edit-cantidad-personas').value);
  const fechaInicio = document.getElementById('edit-fecha-inicio').value;
  const fechaFin = document.getElementById('edit-fecha-fin').value;
  const estadoPago = document.getElementById('edit-estado-pago').value;
  const montoTotal = document.getElementById('edit-monto-total').value;
  const montoPagado = document.getElementById('edit-monto-pagado').value;
  const notas = document.getElementById('edit-notas').value.trim();

  if (!clienteNombre || !clienteTelefono || !cantidadPersonas || !fechaInicio || !fechaFin || !montoTotal) {
    showToast('Por favor completa todos los campos requeridos', 'warning');
    return;
  }

  if (Object.keys(selectedDays).length === 0) {
    showToast('Por favor selecciona al menos un día', 'warning');
    return;
  }

  const overlap = await checkOverlap(currentCabana.id, fechaInicio, fechaFin, currentEditingReservaId);
  if (overlap) {
    showToast('Esta cabaña ya tiene una reserva en las fechas seleccionadas', 'error');
    return;
  }

  const result = await updateReserva(
    currentEditingReservaId,
    clienteNombre,
    clienteTelefono,
    cantidadPersonas,
    fechaInicio,
    fechaFin,
    estadoPago,
    montoTotal,
    montoPagado,
    notas,
    selectedDays
  );

  if (result) {
    closeEditReservaModal();
    loadCalendar();
  }
}

async function handleDeleteReserva() {
  if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
    return;
  }

  const result = await deleteReserva(currentEditingReservaId);

  if (result) {
    closeEditReservaModal();
    loadCalendar();
  }
}

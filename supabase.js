const SUPABASE_URL = 'https://gcgwfjrzljrhaugfxjuq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ3dmanJ6bGpyaGF1Z2Z4anVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjE1MDgsImV4cCI6MjA4MDE5NzUwOH0.KwuBFSHreSYcl0gfCsuv4VikeeGGvWX9GyLLxUrUozg';

let supabase;

async function initSupabase() {
  const { createClient } = window.supabase;
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  return supabase;
}

async function getCabanas() {
  try {
    const { data, error } = await supabase
      .from('cabanas')
      .select('*')
      .eq('activa', true)
      .order('numero', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cabanas:', error);
    showToast('Error al cargar cabañas', 'error');
    return [];
  }
}

async function updateCabana(cabanaId, data) {
  try {
    const { data: result, error } = await supabase
      .from('cabanas')
      .update({
        capacidad: parseInt(data.capacidad),
        precio_base: parseFloat(data.precio_base),
        descripcion: data.descripcion || ''
      })
      .eq('id', cabanaId)
      .select();

    if (error) {
      console.error('Error al actualizar cabaña:', error);
      throw new Error(error.message || 'Error desconocido al actualizar cabaña');
    }

    return result;
  } catch (error) {
    console.error('Excepción en updateCabana:', error);
    throw error;
  }
}

async function getOrCreateCliente(nombre, telefono) {
  try {
    const { data: existing, error: queryError } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .single();

    if (existing) {
      return existing;
    }

    const { data: newCliente, error: createError } = await supabase
      .from('clientes')
      .insert({ nombre, telefono })
      .select()
      .single();

    if (createError) {
      console.error('Error al crear cliente:', createError);
      throw createError;
    }

    return newCliente;
  } catch (error) {
    console.error('Error en getOrCreateCliente:', error);
    throw error;
  }
}

async function getAllClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getAllClientes:', error);
    throw error;
  }
}

async function getReservasByMonth(cabanaId, year, month) {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservas')
      .select('id, cliente_nombre, cliente_telefono, cantidad_personas, fecha_inicio, fecha_fin, estado_pago, monto_total, monto_pagado, notas, created_at')
      .eq('cabana_id', cabanaId)
      .gte('fecha_inicio', startDate)
      .lte('fecha_fin', endDate);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reservas:', error);
    showToast('Error al cargar reservas', 'error');
    return [];
  }
}

async function getDiasReserva(reservaId) {
  try {
    const { data, error } = await supabase
      .from('dias_reserva')
      .select('*')
      .eq('reserva_id', reservaId)
      .order('fecha', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dias_reserva:', error);
    return [];
  }
}

async function checkOverlap(cabanaId, fechaInicio, fechaFin, excludeReservaId = null) {
  try {
    let query = supabase
      .from('reservas')
      .select('id, fecha_inicio, fecha_fin')
      .eq('cabana_id', cabanaId);

    if (excludeReservaId) {
      query = query.neq('id', excludeReservaId);
    }

    const { data, error } = await query;

    if (error) throw error;

    for (let reserva of data) {
      const inicio = new Date(reserva.fecha_inicio);
      const fin = new Date(reserva.fecha_fin);
      const newInicio = new Date(fechaInicio);
      const newFin = new Date(fechaFin);

      if (newInicio <= fin && newFin >= inicio) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking overlap:', error);
    return false;
  }
}

async function createReserva(cabanaId, clienteNombre, clienteTelefono, cantidadPersonas, fechaInicio, fechaFin, estadoPago, montoTotal, montoPagado, notas, diasOcupacion) {
  try {
    await getOrCreateCliente(clienteNombre, clienteTelefono);

    const { data: newReserva, error: errorReserva } = await supabase
      .from('reservas')
      .insert([
        {
          cabana_id: cabanaId,
          cliente_nombre: clienteNombre,
          cliente_telefono: clienteTelefono,
          cantidad_personas: cantidadPersonas,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado_pago: estadoPago,
          monto_total: parseFloat(montoTotal),
          monto_pagado: parseFloat(montoPagado) || 0,
          notas: notas
        }
      ])
      .select();

    if (errorReserva) throw errorReserva;

    const reservaId = newReserva[0].id;

    const diasInsert = [];
    for (const fecha in diasOcupacion) {
      const { am, pm } = diasOcupacion[fecha];
      diasInsert.push({
        reserva_id: reservaId,
        fecha: fecha,
        ocupacion_am: am,
        ocupacion_pm: pm,
        precio_dia: 0,
        notas_dia: ''
      });
    }

    const { error: errorDias } = await supabase
      .from('dias_reserva')
      .insert(diasInsert);

    if (errorDias) throw errorDias;

    showToast('Reserva creada exitosamente', 'success');
    return newReserva[0];
  } catch (error) {
    console.error('Error creating reserva:', error);
    showToast('Error al crear reserva: ' + error.message, 'error');
    return null;
  }
}

async function updateReserva(reservaId, clienteNombre, clienteTelefono, cantidadPersonas, fechaInicio, fechaFin, estadoPago, montoTotal, montoPagado, notas, diasOcupacion) {
  try {
    const { error: errorUpdate } = await supabase
      .from('reservas')
      .update({
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cantidad_personas: cantidadPersonas,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado_pago: estadoPago,
        monto_total: parseFloat(montoTotal),
        monto_pagado: parseFloat(montoPagado) || 0,
        notas: notas
      })
      .eq('id', reservaId);

    if (errorUpdate) throw errorUpdate;

    await supabase
      .from('dias_reserva')
      .delete()
      .eq('reserva_id', reservaId);

    const diasInsert = [];
    for (const fecha in diasOcupacion) {
      const { am, pm } = diasOcupacion[fecha];
      diasInsert.push({
        reserva_id: reservaId,
        fecha: fecha,
        ocupacion_am: am,
        ocupacion_pm: pm,
        precio_dia: 0,
        notas_dia: ''
      });
    }

    const { error: errorDias } = await supabase
      .from('dias_reserva')
      .insert(diasInsert);

    if (errorDias) throw errorDias;

    showToast('Reserva actualizada exitosamente', 'success');
    return true;
  } catch (error) {
    console.error('Error updating reserva:', error);
    showToast('Error al actualizar reserva: ' + error.message, 'error');
    return false;
  }
}

async function deleteReserva(reservaId) {
  try {
    await supabase
      .from('dias_reserva')
      .delete()
      .eq('reserva_id', reservaId);

    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', reservaId);

    if (error) throw error;

    showToast('Reserva eliminada exitosamente', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting reserva:', error);
    showToast('Error al eliminar reserva: ' + error.message, 'error');
    return false;
  }
}

async function getReservaById(reservaId) {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', reservaId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reserva:', error);
    return null;
  }
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.classList.remove('hide');
      toast.classList.add('hidden');
    }, 300);
  }, 3000);
}

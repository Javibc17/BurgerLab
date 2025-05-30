// ...existing code...
export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ...existing code...
export function validarPassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/.test(password);
}

// ...existing code...
export function validarNombre(nombre) {
  return nombre && nombre.trim().length >= 2;
}

// ...existing code...
export function generarHorasDisponibles() {
  const horas = [];
  for (let h = 13; h < 16; h++) {
    horas.push(`${h.toString().padStart(2, '0')}:00`);
    horas.push(`${h.toString().padStart(2, '0')}:30`);
  }
  for (let h = 20; h < 24; h++) {
    horas.push(`${h.toString().padStart(2, '0')}:00`);
    horas.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return horas;
}

// ...existing code...
export function validarCamposReserva({ nombre, email, fecha, hora, personas }) {
  if (!nombre?.trim() || !email?.trim() || !fecha || !hora || !personas) {
    return "Todos los campos son obligatorios";
  }
  return null;
}

// ...existing code...
export function validarFechaHoraReserva(fecha, hora) {
  const now = new Date();
  const reservaDateTime = new Date(`${fecha}T${hora}`);
  if (isNaN(reservaDateTime.getTime())) {
    return "Fecha u hora no válida";
  }
  if (reservaDateTime < now) {
    return "No puedes reservar para una fecha u hora anterior a la actual.";
  }
  return null;
}

// ...existing code...
export function validarHorarioReserva(hora) {
  const [h, m] = hora.split(":").map(Number);
  const minutos = h * 60 + m;
  const enHorarioMediodia = minutos >= 13 * 60 && minutos < 16 * 60;
  const enHorarioNoche = minutos >= 20 * 60 && minutos < 24 * 60;
  if (!enHorarioMediodia && !enHorarioNoche) {
    return "Solo puedes reservar entre 13:00-16:00 y 20:00-00:00.";
  }
  return null;
}

// ...existing code...
export function validarPersonasReserva(personas) {
  const num = Number(personas);
  if (!Number.isInteger(num)) {
    return "El número de personas debe ser un número entero.";
  }
  if (num < 1 || num > 20) {
    return "El número de personas debe estar entre 1 y 20.";
  }
  return null;
}

// ...existing code...
export function existeReservaMismaFechaHora(reservas, fecha, hora, excludeId = null) {
  return reservas.some(r =>
    (excludeId == null || r.id !== excludeId) &&
    r.fecha && r.fecha.slice(0,10) === fecha &&
    r.hora && r.hora.slice(0,5) === hora
  );
}

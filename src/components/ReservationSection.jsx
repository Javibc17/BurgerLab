import React from "react";
import mesaReserva from "../assets/MesaReserva.png";
import api from '../api';
import { EXITOS } from '../utils/exitos';

function ReservationSection({ onReservaCreada }) {
  function normalizeDateInput(val) {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    if (typeof val === 'string') {
      if (val.includes('T')) return val.split('T')[0];
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
        const [d, m, y] = val.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    }
    return val;
  }

  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fecha, setFecha] = React.useState("");
  const [hora, setHora] = React.useState("");
  const [personas, setPersonas] = React.useState(1);
  const [comentario, setComentario] = React.useState("");
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const mensajeTimeoutRef = React.useRef();

  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      if (user.fecha) setFecha(normalizeDateInput(user.fecha));
    }
  }, []);

  React.useEffect(() => {
    if (mensaje) {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 5000);
    }
    return () => {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    };
  }, [mensaje]);

  React.useEffect(() => {
    if (typeof fecha === 'string' && fecha.includes('T')) {
      setFecha(normalizeDateInput(fecha));
    }
  }, [fecha]);

  const generarHorasDisponibles = () => {
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
  };

  const [horasDisponibles, setHorasDisponibles] = React.useState([]);
  React.useEffect(() => {
    const fetchHoras = async () => {
      if (!fecha) {
        setHorasDisponibles([]);
        return;
      }
      try {
        const res = await api.get('/reservas');
        const reservas = res.data || [];
        const reservasDelDia = reservas.filter(r => {
          let fechaReserva = r.fecha;
          if (fechaReserva && fechaReserva.includes('T')) {
            fechaReserva = fechaReserva.split('T')[0];
          }
          if (fechaReserva && fechaReserva.includes('/')) {
            const [d, m, y] = fechaReserva.split('/');
            fechaReserva = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
          return fechaReserva === fecha;
        });
        const reservasPorHora = {};
        reservasDelDia.forEach(r => {
          let horaR = r.hora;
          if (horaR && horaR.length >= 5) horaR = horaR.slice(0,5);
          reservasPorHora[horaR] = (reservasPorHora[horaR] || 0) + 1;
        });
        const todas = generarHorasDisponibles();
        setHorasDisponibles(todas.filter(h => (reservasPorHora[h] || 0) < 5));
      } catch {
        setHorasDisponibles(generarHorasDisponibles());
      }
    };
    fetchHoras();
  }, [fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !email.trim() || !fecha || !hora || !personas) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduce un email válido");
      return;
    }
    let reservaDateTime = null;
    let fechaAEnviar = fecha;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha) && /^\d{2}:\d{2}$/.test(hora)) {
      let [year, month, day] = fecha.split('-').map(Number);
      const fechaObj = new Date(year, month - 1, day);
      fechaObj.setDate(fechaObj.getDate() + 1);
      year = fechaObj.getFullYear();
      month = fechaObj.getMonth() + 1;
      day = fechaObj.getDate();
      reservaDateTime = new Date(year, month - 1, day, ...hora.split(":").map(Number), 0, 0);
      fechaAEnviar = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    if (!reservaDateTime || isNaN(reservaDateTime.getTime())) {
      setError("Fecha u hora no válida");
      return;
    }
    const now = new Date();
    if (reservaDateTime < now) {
      setError("");
      setMensaje("No puedes reservar para una fecha u hora anterior a la actual.");
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 4000);
      return;
    }
    const [h2, m2] = hora.split(":").map(Number);
    const minutos = h2 * 60 + m2;
    const enHorarioMediodia = minutos >= 13 * 60 && minutos < 16 * 60;
    const enHorarioNoche = minutos >= 20 * 60 && minutos < 24 * 60;
    if (!enHorarioMediodia && !enHorarioNoche) {
      setMensaje("Solo puedes reservar entre 13:00-16:00 y 20:00-00:00.");
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 4000);
      return;
    }
    try {
      const res = await api.get('/reservas');
      const reservas = res.data || [];
      const existe = reservas.some(r => {
        let fechaReserva = r.fecha;
        if (fechaReserva && fechaReserva.includes('T')) fechaReserva = fechaReserva.split('T')[0];
        if (fechaReserva && fechaReserva.includes('/')) {
          const [d, m, y] = fechaReserva.split('/');
          fechaReserva = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        let horaReserva = r.hora;
        if (horaReserva && horaReserva.length >= 5) horaReserva = horaReserva.slice(0,5);
        return fechaReserva === fecha && horaReserva === hora;
      });
      if (existe) {
        setMensaje("Ya existe una reserva para esa fecha y hora. Elige otra hora.");
        if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
        mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 4000);
        return;
      }
      const usuarioGuardado = localStorage.getItem('usuario');
      const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
      await api.post('/reservas', {
        nombre,
        email,
        fecha: fechaAEnviar,
        hora,
        personas,
        comentario,
        usuarioId: user ? user.id : null
      });
      setMensaje('¡Reserva realizada con éxito!');
      setFecha(normalizeDateInput(""));
      setHora("");
      setPersonas(1);
      setComentario("");
      if (onReservaCreada) onReservaCreada();
    } catch (err) {
      setError('Error al realizar la reserva');
    }
  };

  return (
    <section className="reservation-section">
      {mensaje && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: 30,
          background: '#fff',
          color: mensaje.includes('éxito') ? '#2e7d32' : '#e63946',
          WebkitTextFillColor: mensaje.includes('éxito') ? '#2e7d32' : '#e63946',
          MozTextFillColor: mensaje.includes('éxito') ? '#2e7d32' : '#e63946',
          textShadow: mensaje.includes('éxito') ? '0 0 1px #2e7d32' : '0 0 1px #e63946',
          border: `2.5px solid ${mensaje.includes('éxito') ? '#2e7d32' : '#e63946'}`,
          padding: '18px 48px 18px 22px',
          borderRadius: 14,
          fontSize: '1.18rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 4px 18px 0 rgba(25,118,210,0.13)',
          minWidth: 320,
          maxWidth: 420,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'opacity 0.3s',
          opacity: 1
        }}>
          <span style={{fontSize: 26, marginRight: 6, display: 'flex', alignItems: 'center'}}>
            {mensaje.includes('éxito') ? <span style={{color:'#2e7d32'}}>&#10003;</span> : <span style={{color:'#e63946'}}>&#9888;</span>}
          </span>
          <span style={{flex:1}}>{mensaje}</span>
          <button
            onClick={() => setMensaje("")}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 22,
              fontWeight: 700,
              marginLeft: 10,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
              transition: 'color 0.2s',
              borderRadius: 4
            }}
            aria-label="Cerrar mensaje"
            tabIndex={0}
            onMouseOver={e => e.currentTarget.style.color = mensaje.includes('éxito') ? '#2e7d32' : '#e63946'}
            onMouseOut={e => e.currentTarget.style.color = '#888'}
          >×</button>
        </div>
      )}
      <div className="reservation-container">
        <div className="reservation-image">
          <img src={mesaReserva} alt="Mesa de reserva" />
        </div>
        <div className="reservation-form-container">
          <h3 className="reservation-title">Reserva una Mesa</h3>
          {error && (
            <div style={{ background: '#fff', color: '#e63946', padding: '10px 24px', borderRadius: 10, fontWeight: 600, marginBottom: 12, fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(230,57,70,0.10)' }}>{error}</div>
          )}
          <form className="reservation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" style={{ color: '#fff' }}>Nombre<span style={{color:'#fff', marginLeft:2}}>*</span></label>
              <input type="text" id="name" name="name" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} required style={{ color: '#222', '::placeholder': { color: '#fff' } }} />
            </div>
            <div className="form-group">
              <label htmlFor="email" style={{ color: '#fff' }}>Correo<span style={{color:'#fff', marginLeft:2}}>*</span></label>
              <input type="email" id="email" name="email" placeholder="Tu correo" value={email} onChange={e => setEmail(e.target.value)} required style={{ color: '#222', '::placeholder': { color: '#fff' } }} />
            </div>
            <div className="form-group">
              <label htmlFor="date" style={{ color: '#fff' }}>Fecha<span style={{color:'#fff', marginLeft:2}}>*</span></label>
              <input type="date" id="date" name="date" value={fecha} onChange={e => setFecha(normalizeDateInput(e.target.value))} required style={{ color: '#222', '::placeholder': { color: '#fff' } }} />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="time" style={{ color: '#fff', fontWeight: 600 }}>Hora<span style={{color:'#fff', marginLeft:2}}>*</span></label>
              <select
                id="time"
                name="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 6,
                  borderRadius: 6,
                  border: 'none',
                  marginTop: 4,
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: '#222',
                  background: '#B03535',
                  fontWeight: 400,
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  appearance: 'none',
                  MozAppearance: 'none',
                  WebkitAppearance: 'none',
                  minHeight: 44
                }}
              >
                <option value="" style={{ color: '#fff', background: '#B03535' }}>Hora</option>
                {horasDisponibles.length === 0 ? (
                  <option value="" disabled style={{ color: '#fff', background: '#B03535' }}>No hay horas disponibles</option>
                ) : (
                  horasDisponibles.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))
                )}
              </select>
              <span style={{
                position: 'absolute',
                right: 12,
                bottom: 14,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'flex-end',
                height: '18px'
              }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 8L10 13L15 8" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="personas" style={{ color: '#fff' }}>Personas<span style={{color:'#fff', marginLeft:2}}>*</span></label>
              <input type="number" id="personas" name="personas" min={1} max={20} value={personas} onChange={e => setPersonas(Number(e.target.value))} required style={{ color: '#222', '::placeholder': { color: '#fff' } }} />
            </div>
            <div className="form-group">
              <label htmlFor="comentario" style={{ color: '#fff' }}>Comentario</label>
              <input type="text" id="comentario" name="comentario" placeholder="(Opcional)" value={comentario} onChange={e => setComentario(e.target.value)} style={{ color: '#222', '::placeholder': { color: '#fff' } }} />
            </div>
            <button type="submit" className="reservation-button">Reservar</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ReservationSection;
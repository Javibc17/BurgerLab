// 1. Imports
import React from "react";
import mesaReserva from "../assets/MesaReserva.png"; // Verifica que esta ruta sea correcta
import api from '../api';

// 2. Componente principal
function ReservationSection() {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fecha, setFecha] = React.useState("");
  const [hora, setHora] = React.useState("");
  const [personas, setPersonas] = React.useState(1);
  const [comentario, setComentario] = React.useState("");
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const mensajeTimeoutRef = React.useRef();

  // Obtener usuario logueado (si existe)
  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setNombre(user.nombre || "");
      setEmail(user.email || "");
    }
  }, []);

  // Autohide mensaje
  React.useEffect(() => {
    if (mensaje) {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 5000);
    }
    return () => {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    };
  }, [mensaje]);

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
    try {
      // Obtener usuario logueado para enviar usuarioId
      const usuarioGuardado = localStorage.getItem('usuario');
      const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
      await api.post('/reservas', {
        nombre,
        email,
        fecha,
        hora,
        personas,
        comentario,
        usuarioId: user ? user.id : null
      });
      setMensaje('¡Reserva realizada con éxito!');
      setFecha("");
      setHora("");
      setPersonas(1);
      setComentario("");
    } catch (err) {
      setError('Error al realizar la reserva');
    }
  };

  return (
    <section className="reservation-section">
      <div className="reservation-container">
        <div className="reservation-image">
          <img src={mesaReserva} alt="Mesa de reserva" />
        </div>
        <div className="reservation-form-container">
          <h3 className="reservation-title">Reserva una Mesa</h3>
          {mensaje && (
            <div style={{ background: '#fff', color: '#e63946', padding: '10px 24px', borderRadius: 10, fontWeight: 600, marginBottom: 12, fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(230,57,70,0.10)' }}>{mensaje}</div>
          )}
          {error && (
            <div style={{ background: '#fff', color: '#e63946', padding: '10px 24px', borderRadius: 10, fontWeight: 600, marginBottom: 12, fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(230,57,70,0.10)' }}>{error}</div>
          )}
          <form className="reservation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" name="name" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input type="email" id="email" name="email" placeholder="Tu correo" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input type="date" id="date" name="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Hora</label>
              <input type="time" id="time" name="time" value={hora} onChange={e => setHora(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="personas">Personas</label>
              <input type="number" id="personas" name="personas" min={1} max={20} value={personas} onChange={e => setPersonas(Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label htmlFor="comentario">Comentario</label>
              <input type="text" id="comentario" name="comentario" placeholder="(Opcional)" value={comentario} onChange={e => setComentario(e.target.value)} />
            </div>
            <button type="submit" className="reservation-button">Reservar</button>
          </form>
        </div>
      </div>
    </section>
  );
}

// 3. Export
export default ReservationSection;
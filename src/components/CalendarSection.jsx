import React from "react";
import api from '../api';
import { validarNombre, validarEmail, validarFechaHoraReserva, validarHorarioReserva, validarPersonasReserva, existeReservaMismaFechaHora } from '../utils/validaciones';
import { ERRORES } from '../utils/errores';
import { EXITOS } from '../utils/exitos';

function CalendarSection({ reservasTrigger }) {
  const [reservas, setReservas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editReserva, setEditReserva] = React.useState(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ nombre: '', email: '', fecha: '', hora: '', personas: 1, comentario: '' });
  const [editError, setEditError] = React.useState('');
  const [editSuccess, setEditSuccess] = React.useState("");
  const [editLoading, setEditLoading] = React.useState(false);
  const mensajeTimeoutRef = React.useRef();

  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      fetchReservas(user.id);
    }
  }, [reservasTrigger]);

  const fetchReservas = async (usuarioId) => {
    setLoading(true);
    try {
      const res = await api.get(`/reservas?usuarioId=${usuarioId}`);
      setReservas(res.data);
    } catch (e) {
      setReservas([]);
    }
    setLoading(false);
  };

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
  const horasDisponibles = React.useMemo(() => generarHorasDisponibles(), []);

  const handleEditClick = (reserva) => {
    let fecha = reserva.fecha;
    if (typeof fecha === 'string' && fecha.length >= 10) {
      fecha = fecha.slice(0, 10);
    } else if (typeof fecha === 'string' && fecha.includes('/')) {
      const [d, m, y] = fecha.split('/');
      fecha = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (fecha instanceof Date) {
      fecha = fecha.toISOString().slice(0, 10);
    } else {
      fecha = String(fecha);
    }
    setEditReserva(reserva);
    setEditForm({
      nombre: reserva.nombre,
      email: reserva.email,
      fecha: fecha || '',
      hora: reserva.hora?.slice(0, 5) || '',
      personas: reserva.personas,
      comentario: reserva.comentario || ''
    });
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setEditLoading(true);
    const { nombre, email, fecha, hora, personas } = editForm;
    if (!validarNombre(nombre)) {
      setEditError(ERRORES.nombre);
      setEditLoading(false);
      return;
    }
    if (!validarEmail(email)) {
      setEditError(ERRORES.email);
      setEditLoading(false);
      return;
    }
    const fechaHoraError = validarFechaHoraReserva(fecha, hora);
    if (fechaHoraError) {
      setEditError(fechaHoraError === "Fecha u hora no válida" ? ERRORES.fechaHora : ERRORES.fechaHoraPasada);
      setEditLoading(false);
      return;
    }
    const horarioError = validarHorarioReserva(hora);
    if (horarioError) {
      setEditError(ERRORES.horario);
      setEditLoading(false);
      return;
    }
    const personasError = validarPersonasReserva(personas);
    if (personasError) {
      setEditError(personasError === "El número de personas debe ser un número entero." ? ERRORES.personasEntero : ERRORES.personas);
      setEditLoading(false);
      return;
    }
    if (existeReservaMismaFechaHora(reservas, fecha, hora, editReserva.id)) {
      setEditError(ERRORES.reservaExistente);
      setEditLoading(false);
      return;
    }
    try {
      const usuarioId = editReserva && editReserva.usuarioId ? editReserva.usuarioId : null;
      let fechaAEnviar = fecha;
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        let [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        fechaObj.setDate(fechaObj.getDate() + 1);
        year = fechaObj.getFullYear();
        month = fechaObj.getMonth() + 1;
        day = fechaObj.getDate();
        fechaAEnviar = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
      await api.put(`/reservas/${editReserva.id}`, { ...editForm, fecha: fechaAEnviar, usuarioId });
      setEditModalOpen(false);
      setEditReserva(null);
      setEditLoading(false);
      setEditSuccess(EXITOS.reservaActualizada);
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        fetchReservas(user.id);
      }
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setEditSuccess(""), 4000);
    } catch (err) {
      setEditError('Error al guardar los cambios');
      setEditLoading(false);
    }
  };

  return (
    <section className="calendar-section" style={{marginTop: 40, position: 'relative', minHeight: '80vh', background: '#d74343'}}>
      <div className="calendar-container custom-scrollbar" style={{background: '#f4c2c2', borderRadius: 5, boxShadow: '0 8px 32px #e6394633', padding: 36, maxWidth: 650, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px solid #ffeaea', maxHeight: 550, overflowY: 'auto', position: 'relative'}}>
        <div style={{width: '100%', maxWidth: 540, flex: 1, borderRadius: 16, boxSizing: 'border-box', paddingRight: 4, minHeight: 120}}>
          {loading ? (
            <div style={{color: '#e63946', textAlign: 'center', fontSize: 24, fontWeight: 700, margin: 60, letterSpacing: 1}}>Cargando reservas...</div>
          ) : (
            <>
              <h3 style={{color: '#e63946', fontFamily: 'Chewy, system-ui', fontSize: '2.5rem', marginBottom: 32, textAlign: 'center', letterSpacing: 2, textShadow: '0 2px 8px #e6394633'}}>Tus Reservas</h3>
              {reservas.length === 0 ? (
                <div style={{color: '#e63946', textAlign: 'center', fontSize: 22, fontWeight: 600, margin: 60, opacity: 0.8}}>No tienes reservas.</div>
              ) : (
                <ul style={{listStyle: 'none', padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 28}}>
                  {reservas.map((r, i) => {
                    const iconoCalendario = (
                      <div style={{display:'flex', alignItems:'center', justifyContent:'center', minWidth: 72, minHeight: 72}}>
                        <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="7" width="24" height="20" rx="5" fill="#fff" stroke="#e63946" strokeWidth="2"/>
                          <path d="M22 4v6M10 4v6" stroke="#e63946" strokeWidth="2" strokeLinecap="round"/>
                          <rect x="10" y="16" width="3" height="3" rx="1.2" fill="#e63946"/>
                          <rect x="15" y="16" width="3" height="3" rx="1.2" fill="#e63946"/>
                          <rect x="20" y="16" width="3" height="3" rx="1.2" fill="#e63946"/>
                        </svg>
                      </div>
                    );
                    const datosReserva = (
                      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%'}}>
                        <span style={{fontSize: '1.35rem', fontWeight: 700, color:'#e63946', letterSpacing: 1, textShadow: '0 1px 4px #e6394633', textAlign:'center'}}>
                          {r.fecha ? r.fecha.slice(0,10) : ''} - {r.hora ? r.hora.slice(0,5) : ''}
                        </span>
                        <div style={{fontSize: '1.13rem', color:'#222', display:'flex', flexDirection:'column', alignItems:'center', gap: 8, marginTop: 8}}>
                          <span><b>Personas:</b> {r.personas}</span>
                          <span><b>Comentario:</b> {r.comentario || <span style={{opacity:0.5}}>Sin comentario</span>}</span>
                        </div>
                        <div style={{display:'flex', gap:12, marginTop:18, alignSelf:'center'}}>
                          <button
                            style={{ background: 'linear-gradient(90deg, #fff 60%, #ffeaea 100%)', color: '#e63946', border: '2px solid #e63946', borderRadius: 10, padding: '8px 22px', fontFamily: 'Chewy, system-ui', fontSize: '1.13rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #e6394633', transition: 'background 0.2s, color 0.2s', outline: 'none' }}
                            onMouseOver={e => {e.currentTarget.style.background='#e63946';e.currentTarget.style.color='#fff';}}
                            onMouseOut={e => {e.currentTarget.style.background='linear-gradient(90deg, #fff 60%, #ffeaea 100%)';e.currentTarget.style.color='#e63946';}}
                            onClick={() => handleEditClick(r)}
                          >Editar</button>
                          <button
                            style={{ background: 'linear-gradient(90deg, #e63946 60%, #f4c2c2 100%)', color: '#fff', border: '2px solid #e63946', borderRadius: 10, padding: '8px 22px', fontFamily: 'Chewy, system-ui', fontSize: '1.13rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #e6394633', transition: 'background 0.2s, color 0.2s', outline: 'none' }}
                            onMouseOver={e => {e.currentTarget.style.background='#fff';e.currentTarget.style.color='#e63946';}}
                            onMouseOut={e => {e.currentTarget.style.background='linear-gradient(90deg, #e63946 60%, #f4c2c2 100%)';e.currentTarget.style.color='#fff';}}
                            onClick={() => descargarTicket(r)}
                          >Descargar</button>
                        </div>
                      </div>
                    );
                    return (
                      <li key={r.id} style={{background: 'linear-gradient(120deg, #fff 60%, #ffeaea 100%)', borderRadius: 18, marginBottom: 0, padding: 28, color: '#222', fontFamily: 'Chewy, system-ui', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 28, boxShadow: '0 4px 18px #e6394633', position: 'relative', border: '2.5px solid #f4c2c2', transition: 'box-shadow 0.2s', minHeight: 120}}>
                        {i % 2 === 0 ? (
                          <>
                            {iconoCalendario}
                            {datosReserva}
                          </>
                        ) : (
                          <>
                            {datosReserva}
                            {iconoCalendario}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
        {editModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '40px 44px 36px 44px', minWidth: 340, boxShadow: '0 12px 40px rgba(230,57,70,0.18)', position: 'relative', maxWidth: '95vw', border: '2.5px solid #f4c2c2' }}>
              <button onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 36, color: '#e63946', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#222'} onMouseOut={e=>e.currentTarget.style.color='#e63946'}>×</button>
              <h3 style={{ textAlign: 'center', fontFamily: 'Chewy, system-ui', fontSize: '2.2rem', color: '#e63946', marginBottom: 28, letterSpacing: 1 }}>Editar Reserva</h3>
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, fontSize:'1.08rem' }}>
                    Nombre <span style={{color:'#e63946'}}>*</span>
                    <input type="text" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} style={{ width:'100%', padding: 10, borderRadius: 10, border: '1.5px solid #ccc', marginTop: 4, fontSize: '1.08rem', background:'#fff8f8' }} required minLength={2} />
                  </label>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, fontSize:'1.08rem' }}>
                    Email <span style={{color:'#e63946'}}>*</span>
                    <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={{ width:'100%', padding: 10, borderRadius: 10, border: '1.5px solid #ccc', marginTop: 4, fontSize: '1.08rem', background:'#fff8f8' }} required />
                  </label>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, fontSize:'1.08rem' }}>
                    Fecha <span style={{color:'#e63946'}}>*</span>
                    <input type="date" value={editForm.fecha} onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))} style={{ width:'100%', padding: 10, borderRadius: 10, border: '1.5px solid #ccc', marginTop: 4, fontSize: '1.08rem', background:'#fff8f8' }} required />
                  </label>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, position: 'relative', fontSize:'1.08rem' }}>
                    Hora <span style={{color:'#e63946'}}>*</span>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <select
                        value={editForm.hora}
                        onChange={e => setEditForm(f => ({ ...f, hora: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 36px 10px 10px',
                          borderRadius: 10,
                          border: '1.5px solid #ccc',
                          marginTop: 4,
                          fontFamily: 'inherit',
                          fontSize: '1.08rem',
                          color: '#222',
                          appearance: 'none',
                          background: '#fff8f8',
                          fontWeight: 400,
                          outline: 'none',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="" disabled>Selecciona una hora</option>
                        {horasDisponibles.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                      }}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 8L10 13L15 8" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </label>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, fontSize:'1.08rem' }}>
                    Personas <span style={{color:'#e63946'}}>*</span>
                    <input type="number" min={1} max={20} value={editForm.personas} onChange={e => setEditForm(f => ({ ...f, personas: Number(e.target.value) }))} style={{ width:'100%', padding: 10, borderRadius: 10, border: '1.5px solid #ccc', marginTop: 4, fontSize: '1.08rem', background:'#fff8f8' }} required />
                  </label>
                  <label style={{ fontWeight: 600, color: '#222', textAlign:'left', marginBottom:2, fontSize:'1.08rem' }}>
                    Comentario
                    <input type="text" value={editForm.comentario} onChange={e => setEditForm(f => ({ ...f, comentario: e.target.value }))} style={{ width:'100%', padding: 10, borderRadius: 10, border: '1.5px solid #ccc', marginTop: 4, fontSize: '1.08rem', background:'#fff8f8' }} />
                  </label>
                </div>
                {editError && <div style={{ color: '#e63946', fontWeight: 700, fontSize: 17, marginTop: 4, textAlign:'center', letterSpacing:0.5 }}>{editError}</div>}
                <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 18 }}>
                  <button type="submit" disabled={editLoading} style={{ background: 'linear-gradient(90deg, #218838 60%, #43a047 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 38px', fontFamily: 'Chewy, system-ui', fontSize: '1.18rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(33,136,56,0.10)', transition: 'background 0.2s, color 0.2s' }}>Guardar cambios</button>
                  <button type="button" onClick={() => setEditModalOpen(false)} style={{ background: 'linear-gradient(90deg, #fff 60%, #ffeaea 100%)', color: '#e63946', border: '2px solid #e63946', borderRadius: 12, padding: '14px 38px', fontFamily: 'Chewy, system-ui', fontSize: '1.18rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #e6394633', transition: 'background 0.2s, color 0.2s' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editSuccess && (
          <div style={{
            position: 'fixed',
            top: 30,
            left: 30,
            background: '#fff',
            color: '#2e7d32',
            WebkitTextFillColor: '#2e7d32',
            MozTextFillColor: '#2e7d32',
            textShadow: '0 0 1px #2e7d32',
            border: '2.5px solid #2e7d32',
            padding: '18px 48px 18px 22px',
            borderRadius: 16,
            fontSize: '1.18rem',
            fontFamily: 'Chewy, system-ui',
            fontWeight: 700,
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
            <span style={{fontSize: 28, marginRight: 8, display: 'flex', alignItems: 'center'}}>&#10003;</span>
            <span style={{flex:1}}>{editSuccess}</span>
            <button
              onClick={() => setEditSuccess("")}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 24,
                fontWeight: 700,
                marginLeft: 12,
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
                transition: 'color 0.2s',
                borderRadius: 4
              }}
              aria-label="Cerrar mensaje"
              tabIndex={0}
              onMouseOver={e => e.currentTarget.style.color = '#2e7d32'}
              onMouseOut={e => e.currentTarget.style.color = '#888'}
            >×</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default CalendarSection;

function descargarTicket(reserva) {
  const contenido = `--- Ticket de Reserva BurgerLab ---\n\nNombre: ${reserva.nombre}\nEmail: ${reserva.email}\nFecha: ${reserva.fecha ? reserva.fecha.slice(0,10) : ''}\nHora: ${reserva.hora ? reserva.hora.slice(0,5) : ''}\nPersonas: ${reserva.personas}\nComentario: ${reserva.comentario || 'Sin comentario'}\n\n¡Gracias por reservar en BurgerLab!`;
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reserva_burgerlab_${reserva.id}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

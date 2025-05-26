import React from "react";
import api from '../api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarSection() {
  const [reservas, setReservas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      fetchReservas(user.id);
    }
  }, []);

  const fetchReservas = async (usuarioId) => {
    setLoading(true);
    console.log('Llamando a:', `/reservas?usuarioId=${usuarioId}`);
    try {
      const res = await api.get(`/reservas?usuarioId=${usuarioId}`);
      setReservas(res.data);
      console.log('Respuesta del backend:', res.data);
    } catch (e) {
      setReservas([]);
      console.error('Error al obtener reservas:', e);
    }
    setLoading(false);
  };

  // Fechas con reservas
  const fechasConReserva = reservas.map(r => r.fecha);

  // Reservas del día seleccionado
  const reservasDelDia = reservas.filter(r => {
    const reservaFecha = (r.fecha || '').split('T')[0].slice(0, 10);
    const seleccionada = selectedDate.toISOString().slice(0, 10);
    return reservaFecha === seleccionada;
  });

  // Función para marcar días con reservas
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const fecha = date.toISOString().slice(0, 10);
      if (fechasConReserva.includes(fecha)) {
        return <div className="calendar-dot" />;
      }
    }
    return null;
  };

  return (
    <section className="calendar-section" style={{marginTop: 40}}>
      <div className="calendar-container" style={{background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e6394633', padding: 32, maxWidth: 480, margin: '0 auto'}}>
        <h3 className="calendar-title" style={{color: '#e63946', fontFamily: 'Chewy, system-ui', fontSize: '1.7rem', marginBottom: 18, textAlign: 'center', letterSpacing: 1}}>Calendario de Reservas</h3>
        {loading ? (
          <div style={{color: '#e63946', textAlign: 'center'}}>Cargando reservas...</div>
        ) : (
          <>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              locale="es-ES"
              className="burgerlab-calendar"
            />
            <div style={{marginTop: 28, minHeight: 80}}>
              <h4 style={{color: '#457b9d', fontFamily: 'Chewy, system-ui', fontSize: '1.15rem', marginBottom: 10, textAlign: 'center', letterSpacing: 0.5}}>
                Reservas para el {selectedDate.toLocaleDateString('es-ES')}
              </h4>
              {reservasDelDia.length === 0 ? (
                <div style={{color: '#e63946', textAlign: 'center'}}>No tienes reservas para este día.</div>
              ) : (
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  {reservasDelDia.map(r => (
                    <li key={r.id} style={{background: '#f4c2c2', borderRadius: 10, marginBottom: 10, padding: 14, color: '#e63946', fontFamily: 'Chewy, system-ui', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 1px 6px #e6394633'}}>
                      <span style={{fontSize: '1.1rem'}}><b>Hora:</b> {r.hora} <b>Personas:</b> {r.personas}</span>
                      <span style={{fontSize: '1.05rem'}}><b>Comentario:</b> {r.comentario || '-'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`
        .burgerlab-calendar {
          border: none !important;
          font-family: 'Chewy', system-ui;
          background: #fff;
        }
        .react-calendar__tile--active {
          background: #e63946 !important;
          color: #fff !important;
        }
        .react-calendar__tile--now {
          background: #f4c2c2 !important;
          color: #e63946 !important;
        }
        .calendar-dot {
          width: 8px;
          height: 8px;
          background: #e63946;
          border-radius: 50%;
          margin: 0 auto;
          margin-top: 2px;
        }
        .react-calendar__tile {
          position: relative;
        }
      `}</style>
    </section>
  );
}

export default CalendarSection;

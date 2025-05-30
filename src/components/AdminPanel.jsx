import React, { useState, useEffect } from "react";
import api from '../api';
import EstadisticasCharts from './EstadisticasCharts';

function AdminPanel({ tabDefault }) {
  const [tab, setTab] = useState(tabDefault || 'usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTab(tabDefault || 'usuarios');
  }, [tabDefault]);

  useEffect(() => {
    setError("");
    setLoading(true);
    if (tab === 'usuarios') {
      api.get('/users')
        .then(res => setUsuarios(res.data))
        .catch(() => setError('Error cargando usuarios'))
        .finally(() => setLoading(false));
    } else if (tab === 'reservas') {
      api.get('/reservas')
        .then(res => setReservas(res.data))
        .catch(() => setError('Error cargando reservas'))
        .finally(() => setLoading(false));
    } else if (tab === 'tickets') {
      api.get('/tickets')
        .then(res => setTickets(res.data))
        .catch(() => setError('Error cargando pedidos'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const showTabs = !tabDefault;

  return (
    <div style={{ padding: 40 }}>
      {loading && <div style={{textAlign:'center',margin:30}}>Cargando...</div>}
      {error && <div style={{color:'#e63946',textAlign:'center',margin:30}}>{error}</div>}
      <div>
        <h2 style={{color:'#e63946',textAlign:'center'}}>Estadísticas</h2>
        <EstadisticasCharts usuarios={usuarios} tickets={tickets} reservas={reservas} />
      </div>
      {tab === 'usuarios' && !loading && (
        <div>
          <h2 style={{color:'#e63946',textAlign:'center'}}>Usuarios</h2>
          <table style={{margin:'0 auto',borderCollapse:'collapse',minWidth:320}}>
            <thead>
              <tr style={{background:'#f4c2c2'}}>
                <th style={{padding:8,border:'1px solid #e63946'}}>ID</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Nombre</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Email</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Rol</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{u.id}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{u.nombre}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{u.email}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{u.rol}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-ES') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'reservas' && !loading && (
        <div>
          <h2 style={{color:'#e63946',textAlign:'center'}}>Reservas</h2>
          <table style={{margin:'0 auto',borderCollapse:'collapse',minWidth:320}}>
            <thead>
              <tr style={{background:'#f4c2c2'}}>
                <th style={{padding:8,border:'1px solid #e63946'}}>ID</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Nombre</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Email</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Fecha</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Hora</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Personas</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Comentario</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Usuario ID</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id}>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.id}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.nombre}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.email}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.fecha || ''}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.hora ? r.hora.slice(0,5) : ''}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.personas}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.comentario}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{r.usuarioId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'tickets' && !loading && (
        <div>
          <h2 style={{color:'#e63946',textAlign:'center'}}>Pedidos</h2>
          <table style={{margin:'0 auto',borderCollapse:'collapse',minWidth:320}}>
            <thead>
              <tr style={{background:'#f4c2c2'}}>
                <th style={{padding:8,border:'1px solid #e63946'}}>ID</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Usuario ID</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Número</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Fecha</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Hora</th>
                <th style={{padding:8,border:'1px solid #e63946'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{t.id}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{t.usuarioId}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{t.numero}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{t.fecha ? new Date(t.fecha).toLocaleDateString('es-ES') : ''}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{t.hora ? t.hora.slice(0,5) : ''}</td>
                  <td style={{padding:8,border:'1px solid #e63946'}}>{Number(t.total).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function EstadisticasCharts({ usuarios, tickets, reservas }) {
  const userActivity = React.useMemo(() => {
    const counts = {};
    tickets.forEach(t => {
      if (!counts[t.usuarioId]) counts[t.usuarioId] = 0;
      counts[t.usuarioId]++;
    });
    return Object.entries(counts)
      .map(([usuarioId, cantidad]) => {
        const user = usuarios.find(u => u.id === Number(usuarioId));
        return { nombre: user ? user.nombre : `ID ${usuarioId}`, cantidad };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 7);
  }, [usuarios, tickets]);

  const productosVendidos = React.useMemo(() => {
    const counts = {};
    tickets.forEach(t => {
      (t.productos || []).forEach(p => {
        if (!counts[p.title]) counts[p.title] = 0;
        counts[p.title]++;
      });
    });
    return Object.entries(counts)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 7);
  }, [tickets]);

  const reservasPorDia = React.useMemo(() => {
    const counts = {};
    (reservas || []).forEach(r => {
      if (r.fecha) {
        const fecha = typeof r.fecha === 'string' ? r.fecha.slice(0, 10) : new Date(r.fecha).toISOString().slice(0, 10);
        if (!counts[fecha]) counts[fecha] = 0;
        counts[fecha]++;
      }
    });
    return Object.entries(counts)
      .map(([fecha, cantidad]) => ({ fecha, cantidad }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [reservas]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginTop: 32, marginBottom: 48 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e6394622', padding: 24, minWidth: 340 }}>
        <h3 style={{ color: '#e63946', textAlign: 'center' }}>Clientes con más actividad</h3>
        <Bar
          data={{
            labels: userActivity.map(u => u.nombre),
            datasets: [{
              label: 'Pedidos',
              data: userActivity.map(u => u.cantidad),
              backgroundColor: '#e63946',
            }],
          }}
          options={{ indexAxis: 'y', plugins: { legend: { display: false } } }}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e6394622', padding: 24, minWidth: 340 }}>
        <h3 style={{ color: '#e63946', textAlign: 'center' }}>Productos más vendidos</h3>
        <Pie
          data={{
            labels: productosVendidos.map(p => p.nombre),
            datasets: [{
              label: 'Vendidos',
              data: productosVendidos.map(p => p.cantidad),
              backgroundColor: [
                '#e63946', '#f4c2c2', '#a8dadc', '#457b9d', '#ffb703', '#fb8500', '#b5179e'
              ],
            }],
          }}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e6394622', padding: 24, minWidth: 340 }}>
        <h3 style={{ color: '#e63946', textAlign: 'center' }}>Reservas por día</h3>
        <Bar
          data={{
            labels: reservasPorDia.map(r => r.fecha),
            datasets: [{
              label: 'Reservas',
              data: reservasPorDia.map(r => r.cantidad),
              backgroundColor: '#457b9d',
            }],
          }}
          options={{ plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}

export default EstadisticasCharts;

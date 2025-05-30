import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import "./App.css";
import logo from "./assets/logo.png";
import logoLetras from "./assets/logoLetras.png";
import MenuCategory from "./components/MenuCategory";
import Footer from "./components/Footer";
import ReservationSection from "./components/ReservationSection";
import ProductModal from "./components/ProductModal";
import api from './api';
import CalendarSection from './components/CalendarSection';
import AdminPanel from "./components/AdminPanel";
import ProductAdminPanel from "./components/ProductAdminPanel";
import CrudTable from "./components/CrudTable";
import BurgerLabCustomizer from "./components/BurgerLabCustomizer";
import shoppingBag from "./assets/fluent--shopping-bag-48-regular (1).png";
import EstadisticasCharts from './components/EstadisticasCharts';

function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString('es-ES');
}
function formatHora(hora) {
  if (!hora) return '';
  if (typeof hora === 'string' && hora.length >= 5) return hora.slice(0,5);
  if (hora instanceof Date) return hora.toTimeString().slice(0,5);
  return hora;
}

function App() {
  const imagenesPerfil = [
    'Captura de pantalla 2025-03-09 163338.png',
    'Captura de pantalla 2025-03-09 163352.png',
    'Captura de pantalla 2025-03-09 163358.png',
    'Captura de pantalla 2025-03-09 163402.png',
    'Captura de pantalla 2025-03-09 163409.png',
    'Captura de pantalla 2025-03-09 163416.png',
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pedido, setPedido] = useState([]);
  const [pedidoVisible, setPedidoVisible] = useState(false);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const mensajeTimeoutRef = React.useRef();
  const [showTicketMsg, setShowTicketMsg] = useState(false);
  const [ultimoTicket, setUltimoTicket] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [numPedidos, setNumPedidos] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [reservasTrigger, setReservasTrigger] = useState(0);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [erroresPerfil, setErroresPerfil] = useState({});
  const navigate = useNavigate ? useNavigate() : () => {};
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [reservasAdmin, setReservasAdmin] = useState([]);
  const [ticketsAdmin, setTicketsAdmin] = useState([]);

  const total = pedido.reduce((acc, item) => {
    const num = parseFloat(item.price.replace(',', '.'));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  React.useEffect(() => {
    try {
      const pedidoGuardado = localStorage.getItem('pedido');
      if (pedidoGuardado) {
        setPedido(JSON.parse(pedidoGuardado));
      }
    } catch (e) {
      setPedido([]);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('pedido', JSON.stringify(pedido));
    } catch (e) {
    }
  }, [pedido]);

  React.useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const userObj = JSON.parse(usuarioGuardado);
        setUsuario(userObj);
        setEditNombre(userObj.nombre);
        setEditEmail(userObj.email);
        setFotoPerfil(userObj.fotoPerfil || null);
      }
    } catch (e) {
      setUsuario(null);
    }
  }, []);

  React.useEffect(() => {
    api.get('/productos')
      .then(res => setProductos(res.data))
      .catch(() => setProductos([]));
  }, []);

  React.useEffect(() => {
    if (mensaje && mensaje.texto) {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(null), 5000);
    }
    return () => {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    };
  }, [mensaje]);

  React.useEffect(() => {
    if (usuario && usuario.id) {
      api.get(`/tickets?usuarioId=${usuario.id}`)
        .then(res => setNumPedidos(res.data.length))
        .catch(() => setNumPedidos(0));
    }
  }, [usuario]);

  React.useEffect(() => {
    if (usuario && usuario.rol === 'admin') {
      api.get('/users').then(res => setUsuariosAdmin(res.data)).catch(() => setUsuariosAdmin([]));
      api.get('/tickets').then(res => setTicketsAdmin(res.data)).catch(() => setTicketsAdmin([]));
      api.get('/reservas').then(res => setReservasAdmin(res.data)).catch(() => setReservasAdmin([]));
    }
  }, [usuario]);

  const handleAddToPedido = (producto) => {
    setPedido([...pedido, producto]);
    setSelectedProduct(null);
    setMensaje({ texto: `Producto añadido: ${producto.title}`, color: '#218838' });
  };

  const handleRemoveFromPedido = (index) => {
    setMensaje({ texto: `Producto eliminado: ${pedido[index].title}`, color: '#e63946' });
    setPedido(pedido.filter((_, i) => i !== index));
  };

  const handleReserve = () => {
    alert("Reserva realizada con éxito!");
  };

  const handleConfirmPedido = async () => {
    if (!pedido || pedido.length === 0) {
      setMensaje({ texto: 'No hay productos en el pedido.', color: '#e63946' });
      return;
    }
    const now = new Date();
    const ticket = {
      usuarioId: usuario.id,
      numero: Math.floor(Math.random() * 90000 + 10000),
      fecha: now.toISOString().slice(0, 10),
      hora: now.toTimeString().slice(0, 5),
      productos: [...pedido],
      total: pedido.reduce((acc, item) => {
        const num = parseFloat(item.price.replace(',', '.'));
        return acc + (isNaN(num) ? 0 : num);
      }, 0)
    };
    try {
      const res = await api.post('/tickets', ticket);
      setUltimoTicket(res.data);
      setMensaje({ texto: '¡Gracias por tu pedido! En breve lo estaremos preparando. Ve al apartado de Mis pedidos para ver el ticket.', color: '#218838' });
      setPedido([]);
      setPedidoVisible(false);
      localStorage.removeItem('pedido');
      if (usuario && usuario.id) {
        const ticketsRes = await api.get(`/tickets?usuarioId=${usuario.id}`);
        setNumPedidos(ticketsRes.data.length);
      }
      setTimeout(() => {
        setMensaje(null);
        setShowTicketMsg(true);
        setTimeout(() => setShowTicketMsg(false), 3500);
      }, 2500);
    } catch (err) {
      setMensaje({ texto: 'Error al guardar el pedido. Intenta de nuevo.', color: '#e63946' });
    }
  };

  React.useEffect(() => {
    if (usuario && usuario.id) {
      api.get(`/tickets?usuarioId=${usuario.id}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setUltimoTicket(res.data[0]);
          } else {
            setUltimoTicket(null);
          }
        })
        .catch(() => setUltimoTicket(null));
    }
  }, [usuario]);

  const handleLogin = () => {
    setShowPerfilModal(true);
  };

  if (!usuario) {
    return <LoginPage 
      onLogin={user => {
        setUsuario(user);
        setEditNombre(user.nombre);
        setEditEmail(user.email);
        localStorage.setItem('usuario', JSON.stringify(user));
        navigate("/");
      }}
      mensajeProp={undefined}
    />;
  }

  if (usuario.rol === 'admin' && showAdminPanel) {
    return <>
      <button onClick={() => setShowAdminPanel(false)} style={{position:'fixed',top:20,left:20,zIndex:9999,background:'#e63946',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontFamily:'Chewy, system-ui',fontSize:'1.1rem',fontWeight:600,cursor:'pointer'}}>Volver a inicio</button>
      <AdminPanel />
    </>;
  }

  const handleReservaCreada = () => {
    setReservasTrigger(t => t + 1);
    setMensaje({ texto: 'Mesa reservada correctamente', color: '#218838' });
    if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    mensajeTimeoutRef.current = setTimeout(() => setMensaje(null), 3000);
  };

  const isBurgerLab = selectedProduct && selectedProduct.title === "BurgerLab";

  return (
    <div className="App">
      {mensaje && mensaje.texto && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: 30,
          background: '#fff',
          color: mensaje.color || '#218838',
          padding: '16px 38px',
          borderRadius: 12,
          fontSize: '1.2rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 2px 12px rgba(33,136,56,0.18)',
          border: '2px solid #218838',
          minWidth: 260,
          textAlign: 'center',
        }}>
          {mensaje.texto}
        </div>
      )}
      
      
      <header className="shadow-container">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#f4c2c2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 38,
                color: '#fff',
                fontWeight: 700,
                border: '3px solid #e63946',
                boxShadow: '0 2px 8px #c13a3a22',
                overflow: 'hidden',
              }}>
                {usuario?.fotoPerfil ? (
                  <img
                    src={usuario.fotoPerfil.startsWith('/') ? usuario.fotoPerfil : `/src/assets/fotoperfil/${usuario.fotoPerfil}`}
                    alt="Perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <span style={{ fontSize: 38 }}>{usuario?.nombre?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontFamily: 'Chewy, system-ui', fontWeight: 700, fontSize: '1.65rem', color: '#f4c2c2', letterSpacing: 1 }}>{usuario?.nombre}</span>
                <span style={{ fontFamily: 'Chewy, system-ui', fontWeight: 500, fontSize: '1.15rem', color: '#C13A3A', marginTop: 6 }}>{usuario?.rol}</span>
              </div>
            </div>
          </div>
          <nav className="navbar">
            <ul className="nav-links">
              {usuario.rol !== 'admin' && (
                <li className="dropdown underline-anim" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                  <a href="#inicio">Menú</a>
                  {menuOpen && (
                    <ul className="dropdown-menu">
                      <li><a href="#entrantes">Entrantes</a></li>
                      <li><a href="#burgers">Hamburguesas</a></li>
                      <li><a href="#postres">Postres</a></li>
                    </ul>
                  )}
                </li>
              )}
              {usuario.rol === 'admin' ? (
                <>
                  <li className="underline-anim"><a href="#estadisticas">Estadísticas</a></li>
                  <li className="underline-anim"><a href="#reservas">Reservas</a></li>
                  <li className="underline-anim"><a href="#usuarios">Usuarios</a></li>
                  <li className="underline-anim"><a href="#pedidos">Pedidos</a></li>
                  <li className="underline-anim"><a href="#productos">Productos</a></li>
                </>
              ) : (
                <>
                  <li className="underline-anim"><a href="#reservas">Reservas</a></li>
                  <li className="underline-anim"><a href="#mis-pedidos">Último pedido</a></li>
                </>
              )}
              <li className="login-li">
                <button className="login-btn" onClick={handleLogin} title="Perfil">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#f4c2c2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.6-4 8-4s8 1.5 8 4"/></svg>
                  <span className="login-text" style={{ fontFamily: 'Chewy, system-ui', fontSize: '2.1rem', fontWeight: 400 }}>Perfil</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="content">
            <div className="logo">
              <img src={logoLetras} alt="Burger Lab Logo" />
            </div>
          </div>
        </div>
      </header>

      <main className="menu-section" id="inicio">
        {usuario.rol !== 'admin' && usuario.rol !== 'empleado' && (
          <>
            <div className="menu-header">
              <img src={logo} alt="Menu Icon" className="menu-logo" />
              <h2 className="menu-title">MENÚ</h2>
            </div>
            <MenuCategory title="ENTRANTES" items={productos.filter(p => p.categoria === 'entrantes')} id="entrantes" onProductClick={setSelectedProduct} />
            <MenuCategory title="HAMBURGUESAS" items={productos.filter(p => p.categoria === 'hamburguesas')} id="burgers" onProductClick={setSelectedProduct} />
            <MenuCategory title="POSTRES" items={productos.filter(p => p.categoria === 'postres')} id="postres" onProductClick={setSelectedProduct} />
            <div style={{textAlign: 'center', margin: '32px 0'}}>
              <button 
                className="ver-pedido-btn-destacado"
                onClick={() => setPedidoVisible(true)}
              >
                Ver pedido
              </button>
            </div>
            {pedidoVisible && (
              <div className="pedido-modal-bg" onClick={() => setPedidoVisible(false)}>
                <div className="pedido-modal" onClick={e => e.stopPropagation()}>
                  <button className="pedido-modal-close" onClick={() => setPedidoVisible(false)}>×</button>
                  <h3 className="pedido-modal-title">Tu Pedido</h3>
                  {pedido.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#e63946', margin: 0}}>No has añadido productos.</p>
                  ) : (
                    <ul className="pedido-modal-list">
                      {pedido.map((item, idx) => (
                        <li key={idx}>
                          <button className="pedido-modal-remove" onClick={() => handleRemoveFromPedido(idx)} title="Eliminar">✕</button>
                          <span className="pedido-modal-item-title">{item.title}</span>
                          <span className="pedido-modal-item-price">{String(item.price).includes('€') ? item.price : `${item.price} €`}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <hr className="pedido-modal-hr" />
                  <div className="pedido-modal-total">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  {pedido.length > 0 && (
                    <button className="pedido-modal-btn" onClick={handleConfirmPedido}>
                      Realizar pedido
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {usuario.rol === 'admin' ? (
          <>
            <div className="menu-header reservas-header" id="estadisticas">
              <img src={logo} alt="Estadísticas Icon" className="menu-logo" />
              <h2 className="menu-title">ESTADÍSTICAS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <EstadisticasCharts
                usuarios={usuariosAdmin}
                tickets={ticketsAdmin}
                reservas={reservasAdmin}
              />
            </div>
            <div className="menu-header reservas-header" id="usuarios">
              <img src={logo} alt="Usuarios Icon" className="menu-logo" />
              <h2 className="menu-title">USUARIOS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/users"
                title="Usuarios"
                columns={[
                  { key: "id", label: "ID" },
                  { key: "nombre", label: "Nombre" },
                  { key: "email", label: "Email" },
                  { key: "rol", label: "Rol" },
                  { key: "fechaRegistro", label: "Fecha Registro", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                ]}
                addLabel="Añadir usuario"
              />
            </div>
            <div className="menu-header reservas-header" id="reservas">
              <img src={logo} alt="Reservas Icon" className="menu-logo" />
              <h2 className="menu-title">RESERVAS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/reservas"
                title="Reservas"
                columns={[
                  { key: "nombre", label: "Nombre" },
                  { key: "email", label: "Email" },
                  { key: "fecha", label: "Fecha", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                  { key: "hora", label: "Hora", format: v => v ? v.slice(0,5) : '' },
                  { key: "personas", label: "Personas" },
                  { key: "comentario", label: "Comentario" },
                ]}
                addLabel="Añadir reserva"
              />
            </div>
            <div className="menu-header reservas-header" id="pedidos">
              <img src={logo} alt="Pedidos Icon" className="menu-logo" />
              <h2 className="menu-title">PEDIDOS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/tickets"
                title="Pedidos"
                columns={[
                  { key: "usuarioNombre", label: "Usuario", format: (v, row) => row.usuarioNombre || row.usuarioId || '' },
                  { key: "numero", label: "Número" },
                  { key: "fecha", label: "Fecha", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                  { key: "hora", label: "Hora", format: v => v ? v.slice(0,5) : '' },
                  { key: "total", label: "Total", format: v => Number(v).toFixed(2) + ' €' },
                ]}
                addLabel="Añadir pedido"
              />
            </div>
            <div className="menu-header reservas-header" id="productos">
              <img src={logo} alt="Productos Icon" className="menu-logo" />
              <h2 className="menu-title">PRODUCTOS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/productos"
                title="Productos"
                columns={[
                  { key: "id", label: "ID" },
                  { key: "categoria", label: "Categoría" },
                  { key: "title", label: "Nombre" },
                  { key: "price", label: "Precio", format: v => v !== undefined && v !== null ? `${v} €` : "" },
                  { key: "description", label: "Descripción" },
                  { key: "image", label: "Imagen" },
                  { key: "modalImage", label: "Imagen real" },
                ]}
                addLabel="Añadir producto"
              />
            </div>
          </>
        ) : usuario.rol === 'empleado' ? (
          <>
           
            <div className="menu-header reservas-header" id="pedidos-empleado">
              <img src={logo} alt="Pedidos Icon" className="menu-logo" />
              <h2 className="menu-title">PEDIDOS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/tickets"
                title="Pedidos"
                columns={[
                  { key: "usuarioNombre", label: "Usuario", format: (v, row) => row.usuarioNombre || row.usuarioId || '' },
                  { key: "numero", label: "Número" },
                  { key: "fecha", label: "Fecha", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                  { key: "hora", label: "Hora", format: v => v ? v.slice(0,5) : '' },
                  { key: "total", label: "Total", format: v => Number(v).toFixed(2) + ' €' },
                ]}
                addLabel={null}
              />
            </div>
            <div className="menu-header reservas-header" id="reservas-empleado">
              <img src={logo} alt="Reservas Icon" className="menu-logo" />
              <h2 className="menu-title">RESERVAS</h2>
            </div>
            <div style={{marginBottom: 48}}>
              <CrudTable
                endpoint="/reservas"
                title="Reservas"
                columns={[
                  { key: "nombre", label: "Nombre" },
                  { key: "email", label: "Email" },
                  { key: "fecha", label: "Fecha", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                  { key: "hora", label: "Hora", format: v => v ? v.slice(0,5) : '' },
                  { key: "personas", label: "Personas" },
                  { key: "comentario", label: "Comentario" },
                ]}
                addLabel={null}
              />
            </div>
          </>
        ) : (
          <>
            <div className="menu-header reservas-header" id="reservas">
              <img src={logo} alt="Reservation Icon" className="menu-logo" />
              <h2 className="menu-title">RESERVAS</h2>
            </div>
            <ReservationSection onReservaCreada={handleReservaCreada} />
            <CalendarSection reservasTrigger={reservasTrigger} />
            {selectedProduct && (
              <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
                  {isBurgerLab ? (
                    <BurgerLabCustomizer onAddToPedido={handleAddToPedido} />
                  ) : (
                    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToPedido={handleAddToPedido} />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {usuario.rol !== 'admin' && usuario.rol !== 'empleado' && (
        <section className="menu-section" id="mis-pedidos">
          <div className="menu-header">
            <img src={logo} alt="Ticket Icon" className="menu-logo" />
            <h2 className="menu-title">ÚLTIMO PEDIDO</h2>
          </div>
          {ultimoTicket ? (
            <div className="ticket-realista-container">
              <div className="ticket-realista">
                <div className="ticket-header">
                  <h3>Burger Lab</h3>
                  <div className="ticket-info">
                    <span>Nº Pedido: <b>{ultimoTicket.numero}</b></span><br/>
                    <span>Fecha: {formatFecha(ultimoTicket.fecha)}</span><br/>
                    <span>Hora: {formatHora(ultimoTicket.hora)}</span><br/>
                    <span>Email: {usuario.email}</span>
                  </div>
                </div>
                <hr className="ticket-hr" />
                <div className="ticket-productos">
                  {(ultimoTicket.productos || []).map((prod, idx) => (
                    <div className="ticket-producto" key={idx}>
                      <span className="ticket-prod-nombre">{prod.title}</span>
                      <span className="ticket-prod-precio">{String(prod.price).includes('€') ? prod.price : `${prod.price} €`}</span>
                    </div>
                  ))}
                </div>
                <hr className="ticket-hr" />
                <div className="ticket-total">
                  <span>Total:</span>
                  <span>{Number(ultimoTicket.total).toFixed(2)} €</span>
                </div>
                <div className="ticket-footer">¡Gracias por tu compra!</div>
                <button
                  style={{
                    marginTop: 18,
                    background: '#e63946',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontWeight: 700,
                    fontSize: '1.08rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #e6394633',
                    fontFamily: 'Chewy, system-ui',
                    letterSpacing: 1,
                    width: '100%'
                  }}
                  onClick={() => descargarTicketUltimoPedido(ultimoTicket, usuario)}
                >
                  Descargar ticket
                </button>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', margin: '32px 0', color: '#fff', fontFamily: 'Chewy, system-ui', fontSize: '1.3rem', fontWeight: 600}}>
              <div style={{marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
                <img src={shoppingBag} alt="Bolsa" style={{width: 92, height: 92, marginBottom: 14, objectFit: 'contain', filter: 'brightness(0) invert(1)'}} />
                <div style={{fontWeight: 900, fontSize: '2.1rem', marginBottom: 4, color: '#fff', lineHeight: 1.1}}>Aún no has realizado pedidos</div>
                <div style={{fontWeight: 400, fontSize: '1.25rem', color: '#fff', lineHeight: 1.2}}>Explora nuestro menú y haz tu primera selección</div>
              </div>
              <div style={{
                margin: '0 auto',
                maxWidth: 900,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0
              }}>
                <h4 style={{
                  color: '#C13A3A',
                  fontFamily: 'Chewy, system-ui',
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  marginBottom: 22,
                  letterSpacing: 1,
                  textShadow: '0 2px 8px #f4c2c2cc, 0 1px 0 #fff',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg,#fff,#f4c2c2 60%,#fff)',
                  borderRadius: 8,
                  padding: '8px 24px',
                  display: 'inline-block',
                  boxShadow: '0 2px 8px #c13a3a11'
                }}>Recomendaciones populares</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24}}>
                  {['Nachos', 'Bestia Nuclear', 'Fusión Tropical', 'Tarta de Pantera Rosa'].map((nombre, idx) => {
                    const prod = productos.find(p => p.title === nombre);
                    if (!prod) return null;
                    let hash = '#inicio';
                    if (prod.categoria === 'entrantes') hash = '#inicio';
                    else if (prod.categoria === 'hamburguesas') hash = '#inicio';
                    else if (prod.categoria === 'postres') hash = '#inicio';
                    return (
                      <div key={prod.id || prod.title || idx} style={{
                        background: '#f4c2c2',
                        borderRadius: 14,
                        boxShadow: '0 2px 8px #c13a3a22',
                        border: '2px solid #fff',
                        padding: 18,
                        minWidth: 140,
                        maxWidth: 180,
                        margin: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }} onClick={() => { window.location.hash = hash; }}>
                        <img src={prod.image} alt={prod.title} style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: 10, background: '#fff'}} />
                        <span style={{fontWeight: 700, color: '#C13A3A', fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', marginBottom: 2, letterSpacing: 0.5}}>{prod.title}</span>
                        <span style={{color: '#111', fontSize: '1rem', marginTop: 4}}>{String(prod.price).includes('€') ? prod.price : `${prod.price} €`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {showPerfilModal && usuario && (
        <div className="perfil-modal-bg" onClick={() => setShowPerfilModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000
        }}>
          <div className="perfil-modal" onClick={e => e.stopPropagation()} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '32px 36px 28px 36px',
            minWidth: 340,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            position: 'relative',
            maxWidth: '90vw'
          }}>
            <button className="perfil-modal-close" onClick={() => setShowPerfilModal(false)} style={{
              position: 'absolute',
              top: 12,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 28,
              color: '#e63946',
              cursor: 'pointer',
              fontWeight: 700
            }}>×</button>
            <h3 className="perfil-modal-title" style={{
              textAlign: 'center',
              fontFamily: 'Chewy, system-ui',
              fontSize: '2rem',
              color: '#e63946',
              marginBottom: 18
            }}>Perfil de Usuario</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const errores = {};
              if (!editNombre || editNombre.trim().length < 2) {
                errores.nombre = 'El nombre es obligatorio y debe tener al menos 2 caracteres.';
              }
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!editEmail || !emailRegex.test(editEmail)) {
                errores.email = 'Introduce un email válido.';
              }
              setErroresPerfil(errores);
              if (Object.keys(errores).length > 0) return;
              try {
                await api.put(`/users/${usuario.id}`, { nombre: editNombre, email: editEmail, fotoPerfil });
                const updatedUser = { ...usuario, nombre: editNombre, email: editEmail, fotoPerfil };
                setUsuario(updatedUser);
                localStorage.setItem('usuario', JSON.stringify(updatedUser));
                setShowPerfilModal(false);
                setMensaje({ texto: 'Datos actualizados correctamente', color: '#218838' });
                setErroresPerfil({});
              } catch (err) {
                if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('email')) {
                  setErroresPerfil({ email: 'Este email ya está registrado.' });
                } else {
                  setMensaje({ texto: 'Error al actualizar los datos', color: '#e63946' });
                }
              }
            }}>
              <div className="perfil-modal-info" style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 10, marginBottom: 10 }}>
                <label style={{ fontWeight: 600, color: '#222' }}>Nombre:
                  <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required minLength={2} />
                  {erroresPerfil.nombre && (
                    <div style={{ color: '#e63946', fontSize: '0.98rem', marginTop: 2, fontWeight: 500 }}>{erroresPerfil.nombre}</div>
                  )}
                </label>
                <label style={{ fontWeight: 600, color: '#222' }}>Email:
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
                  {erroresPerfil.email && (
                    <div style={{ color: '#e63946', fontSize: '0.98rem', marginTop: 2, fontWeight: 500 }}>{erroresPerfil.email}</div>
                  )}
                </label>
                <div style={{ margin: '10px 0 0 0' }}>
                  <label style={{ fontWeight: 600, color: '#222', marginBottom: 4, display: 'block' }}>Foto de perfil:</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {imagenesPerfil.map(img => (
                      <img
                        key={img}
                        src={`/src/assets/fotoperfil/${img}`}
                        alt={img}
                        onClick={() => setFotoPerfil(img)}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          border: fotoPerfil === img ? '3px solid #e63946' : '2px solid #ccc',
                          cursor: 'pointer',
                          objectFit: 'cover',
                          boxShadow: fotoPerfil === img ? '0 2px 8px #e63946aa' : '0 1px 4px #aaa2',
                          transition: 'border 0.2s, box-shadow 0.2s',
                          background: '#fff',
                        }}
                      />
                    ))}
                  </div>
                </div>
                {usuario.rol !== 'admin' && (
                  <div><b style={{ color: '#e63946' }}>Rol:</b> <span style={{ color: '#e63946', fontWeight: 700 }}>{usuario.rol}</span></div>
                )}
                {usuario.rol === 'admin' && (
                  <div><b style={{ color: '#e63946' }}>Rol:</b> <span style={{ color: '#e63946', fontWeight: 700 }}>admin</span></div>
                )}
                {usuario.rol !== 'admin' && usuario.rol !== 'empleado' && (
                  <div style={{ color: '#e63946', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <b>Número de pedidos:</b> <span>{numPedidos}</span>
                    <button
                      type="button"
                      style={{
                        marginLeft: 8,
                        background: '#fff',
                        color: '#e63946',
                        border: '1.5px solid #e63946',
                        borderRadius: 7,
                        padding: '4px 14px',
                        fontFamily: 'Chewy, system-ui',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(230,57,70,0.10)'
                      }}
                      onClick={async () => {
                        if (!showHistorial) {
                          try {
                            const res = await api.get(`/tickets?usuarioId=${usuario.id}`);
                            setHistorialPedidos(res.data);
                          } catch {
                            setHistorialPedidos([]);
                          }
                        }
                        setShowHistorial(true);
                      }}
                    >Historial de pedidos</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 28, marginTop: 32, justifyContent: 'center' }}>
                <button type="submit" style={{
                  background: '#fff',
                  color: '#e63946',
                  border: '2px solid #e63946',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontFamily: 'Chewy, system-ui',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(230,57,70,0.10)'
                }}>Guardar cambios</button>
                <button type="button" onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    background: '#e63946',
                    color: '#fff',
                    border: '2px solid #e63946',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontFamily: 'Chewy, system-ui',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(230,57,70,0.10)'
                  }}
                >Cerrar sesión</button>
              </div>
            </form>
            {showLogoutConfirm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5000
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '32px 28px',
                  minWidth: 280,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  textAlign: 'center',
                  maxWidth: '90vw'
                }}>
                  <div style={{ fontFamily: 'Chewy, system-ui', fontSize: '1.3rem', color: '#e63946', marginBottom: 18 }}>
                    ¿Seguro que quieres cerrar sesión?
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button onClick={() => {
                      setUsuario(null);
                      localStorage.removeItem('usuario');
                      setShowPerfilModal(false);
                      setShowLogoutConfirm(false);
                      setMensaje({ texto: 'Sesión cerrada correctamente', color: '#218838' });
                      setTimeout(() => setMensaje(null), 5000);
                    }}
                      style={{
                        background: '#e63946',
                        color: '#fff',
                        border: '2px solid #e63946',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontFamily: 'Chewy, system-ui',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(230,57,70,0.10)'
                      }}
                    >Confirmar</button>
                    <button onClick={() => setShowLogoutConfirm(false)}
                      style={{
                        background: '#fff',
                        color: '#e63946',
                        border: '2px solid #e63946',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontFamily: 'Chewy, system-ui',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(230,57,70,0.10)'
                      }}
                    >Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            {showHistorial && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 6000
                }}
                onClick={() => setShowHistorial(false)}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '32px 24px',
                    minWidth: 340,
                    maxWidth: 420,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    position: 'relative'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={() => setShowHistorial(false)} style={{
                    position: 'absolute',
                    top: 10,
                    right: 16,
                    background: 'none',
                    border: 'none',
                    fontSize: 26,
                    color: '#e63946',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}>×</button>
                  <h3 style={{
                    textAlign: 'center',
                    fontFamily: 'Chewy, system-ui',
                    fontSize: '1.5rem',
                    color: '#e63946',
                    marginBottom: 18
                  }}>Historial de Pedidos</h3>
                  {historialPedidos && historialPedidos.length > 0 ? (
                    historialPedidos.map((ticket, idx) => (
                      <div key={ticket.id || idx} className="ticket-realista" style={{ marginBottom: 18 }}>
                        <div className="ticket-header">
                          <h3>Burger Lab</h3>
                          <div className="ticket-info">
                            <span>Nº Pedido: <b>{ticket.numero}</b></span><br/>
                            <span>Fecha: {formatFecha(ticket.fecha)}</span><br/>
                            <span>Hora: {formatHora(ticket.hora)}</span><br/>
                            <span>Email: {usuario.email}</span>
                          </div>
                        </div>
                        <hr className="ticket-hr" />
                        <div className="ticket-productos">
                          {(ticket.productos || []).map((prod, i) => (
                            <div className="ticket-producto" key={i}>
                              <span className="ticket-prod-nombre">{prod.title}</span>
                              <span className="ticket-prod-precio">{String(prod.price).includes('€') ? prod.price : `${prod.price} €`}</span>
                            </div>
                          ))}
                        </div>
                        <hr className="ticket-hr" />
                        <div className="ticket-total">
                          <span>Total:</span>
                          <span>{Number(ticket.total).toFixed(2)} €</span>
                        </div>
                        <div className="ticket-footer">¡Gracias por tu compra!</div>
                      </div>
                    ))
                  ) : (
                    <div style={{textAlign: 'center', color: '#e63946', fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', fontWeight: 600}}>
                      No hay pedidos anteriores.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function AppWithRouter() {
  const [mensajeRegistro, setMensajeRegistro] = React.useState("");
  function LoginRouteWrapper(props) {
    const navigate = useNavigate();
    const [mensajeLogin, setMensajeLogin] = React.useState("");
    return (
      <LoginPage
        {...props}
        mensajeProp={mensajeLogin || props.mensajeProp}
        setMensajeProp={msg => {
          setMensajeLogin(msg);
          if (props.setMensajeProp) props.setMensajeProp(msg);
        }}
        onLogin={user => {
          setMensajeLogin('¡Inicio de sesión exitoso!');
          setTimeout(() => setMensajeLogin(''), 5000);
          navigate("/");
        }}
      />
    );
  }
  function RegisterRouteWrapper(props) {
    const navigate = useNavigate();
    return <RegisterPage {...props} onRegister={(user) => {
      setMensajeRegistro('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      navigate("/login");
    }} />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRouteWrapper mensajeProp={mensajeRegistro} setMensajeProp={setMensajeRegistro} />} />
        <Route path="/register" element={<RegisterRouteWrapper />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}

function descargarTicketUltimoPedido(ticket, usuario) {
  const fecha = ticket.fecha ? new Date(ticket.fecha) : new Date();
  const fechaStr = fecha.toLocaleDateString();
  const horaStr = ticket.hora || fecha.toLocaleTimeString();
  let contenido = '';
  contenido += '        BURGERLAB\n';
  contenido += '   Av. de la Hamburguesa 123\n';
  contenido += '      Tel: 900 123 456\n';
  contenido += '------------------------------\n';
  contenido += `Nº Pedido: ${ticket.numero}\n`;
  contenido += `Fecha: ${fechaStr}  Hora: ${horaStr}\n`;
  contenido += `Email: ${usuario?.email || ''}\n`;
  contenido += '------------------------------\n';
  contenido += 'Cant  Producto           Precio\n';
  contenido += '------------------------------\n';
  (ticket.productos || []).forEach((item) => {
    const cantidad = item.cantidad || 1;
    let nombre = item.title;
    if (nombre.length > 16) nombre = nombre.slice(0, 13) + '...';
    else nombre = nombre.padEnd(16, ' ');
    let precio = String(item.price).replace('€','').trim();
    if (!precio.includes('.')) precio += '.00';
    precio = precio.padStart(6, ' ');
    contenido += `${cantidad.toString().padStart(2,' ')}   ${nombre}${precio} €\n`;
  });
  contenido += '------------------------------\n';
  contenido += `TOTAL:${Number(ticket.total).toFixed(2).padStart(21,' ')} €\n`;
  contenido += '------------------------------\n';
  contenido += '   ¡Gracias por tu pedido!\n';
  contenido += '        www.burgerlab.com\n';
  contenido += '------------------------------\n';
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket_pedido_burgerlab_${ticket.numero || fecha.getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export default AppWithRouter;

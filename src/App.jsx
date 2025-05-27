// 1. Imports
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

// Utilidad para formatear fecha y hora
function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString('es-ES');
}
function formatHora(hora) {
  if (!hora) return '';
  // Si es tipo string tipo '09:53:00' => '09:53'
  if (typeof hora === 'string' && hora.length >= 5) return hora.slice(0,5);
  // Si es tipo Date
  if (hora instanceof Date) return hora.toTimeString().slice(0,5);
  return hora;
}

// 2. Componente principal
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Estado para el pedido
  const [pedido, setPedido] = useState([]);
  const [pedidoVisible, setPedidoVisible] = useState(false);
  // Estado para productos del backend
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState("");
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
  const navigate = useNavigate ? useNavigate() : () => {};
  // Calcular el total
  const total = pedido.reduce((acc, item) => {
    // Extraer el número del precio (puede venir como "9,50 €")
    const num = parseFloat(item.price.replace(',', '.'));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  // Cargar pedido de localStorage al iniciar (solo una vez)
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

  // Guardar pedido en localStorage cada vez que cambie
  React.useEffect(() => {
    try {
      localStorage.setItem('pedido', JSON.stringify(pedido));
    } catch (e) {
      // Ignorar errores de almacenamiento
    }
  }, [pedido]);

  // Cargar usuario de localStorage al iniciar (solo una vez)
  React.useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
        setEditNombre(JSON.parse(usuarioGuardado).nombre);
        setEditEmail(JSON.parse(usuarioGuardado).email);
      }
    } catch (e) {
      setUsuario(null);
    }
  }, []);

  // Obtener productos del backend al cargar
  React.useEffect(() => {
    api.get('/productos')
      .then(res => setProductos(res.data))
      .catch(() => setProductos([]));
  }, []);

  // Mensaje global con autohide
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
    if (usuario && usuario.id) {
      api.get(`/tickets?usuarioId=${usuario.id}`)
        .then(res => setNumPedidos(res.data.length))
        .catch(() => setNumPedidos(0));
    }
  }, [usuario]);

  const handleAddToPedido = (producto) => {
    setPedido([...pedido, producto]);
    setSelectedProduct(null); // Cierra el modal al añadir
    setMensaje(`Producto añadido: ${producto.title}`);
  };

  const handleRemoveFromPedido = (index) => {
    setMensaje(`Producto eliminado: ${pedido[index].title}`);
    setPedido(pedido.filter((_, i) => i !== index));
  };

  const handleReserve = () => {
    alert("Reserva realizada con éxito!");
  };

  // Nueva función para confirmar pedido
  const handleConfirmPedido = async () => {
    const now = new Date();
    const ticket = {
      usuarioId: usuario.id, // <-- Añadir usuarioId
      numero: Math.floor(Math.random() * 90000 + 10000),
      fecha: now.toISOString().slice(0, 10), // YYYY-MM-DD para MySQL
      hora: now.toTimeString().slice(0, 5),  // HH:mm para MySQL
      productos: [...pedido],
      total: pedido.reduce((acc, item) => {
        const num = parseFloat(item.price.replace(',', '.'));
        return acc + (isNaN(num) ? 0 : num);
      }, 0)
    };
    try {
      // Guardar ticket en backend MySQL
      const res = await api.post('/tickets', ticket);
      setUltimoTicket(res.data);
      setMensaje('¡Gracias por tu pedido! En breve lo estaremos preparando.');
      setPedido([]);
      setPedidoVisible(false);
      localStorage.removeItem('pedido');
      // ACTUALIZAR NÚMERO DE PEDIDOS SIN RECARGAR
      if (usuario && usuario.id) {
        const ticketsRes = await api.get(`/tickets?usuarioId=${usuario.id}`);
        setNumPedidos(ticketsRes.data.length);
      }
      setTimeout(() => {
        setMensaje('');
        setShowTicketMsg(true);
        setTimeout(() => setShowTicketMsg(false), 3500);
      }, 2500);
    } catch (err) {
      setMensaje('Error al guardar el pedido. Intenta de nuevo.');
    }
  };

  // Al cargar, obtener el último ticket del usuario logueado
  React.useEffect(() => {
    if (usuario && usuario.id) {
      api.get(`/tickets?usuarioId=${usuario.id}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setUltimoTicket(res.data[0]); // El más reciente del usuario
          } else {
            setUltimoTicket(null);
          }
        })
        .catch(() => setUltimoTicket(null));
    }
  }, [usuario]);

  // Handler para el botón de perfil/login
  const handleLogin = () => {
    setShowPerfilModal(true);
  };

  // Si no está logueado, mostrar LoginPage
  if (!usuario) {
    // Solo mostrar mensajeProp si existe, y pasarlo a LoginPage
    return <LoginPage 
      onLogin={user => {
        setUsuario(user);
        setEditNombre(user.nombre);
        setEditEmail(user.email);
        localStorage.setItem('usuario', JSON.stringify(user));
        navigate("/");
      }}
      mensajeProp={undefined} // No usar window.mensajeRegistro, se gestiona por el router
    />;
  }

  // Si el usuario es admin y quiere ver el panel de admin
  if (usuario.rol === 'admin' && showAdminPanel) {
    return <>
      <button onClick={() => setShowAdminPanel(false)} style={{position:'fixed',top:20,left:20,zIndex:9999,background:'#e63946',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontFamily:'Chewy, system-ui',fontSize:'1.1rem',fontWeight:600,cursor:'pointer'}}>Volver a inicio</button>
      <AdminPanel />
    </>;
  }

  return (
    <div className="App">
      {mensaje && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: 30,
          background: '#fff',
          color: '#e63946',
          padding: '16px 38px',
          borderRadius: 12,
          fontSize: '1.2rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
        }}>
          {mensaje}
        </div>
      )}
      {showTicketMsg && (
        <div style={{
          position: 'fixed',
          top: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: '#e63946',
          padding: '16px 38px',
          borderRadius: 12,
          fontSize: '1.2rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
        }}>
          Ve al apartado de <b>Mis pedidos</b> para ver el ticket.
        </div>
      )}
      <header className="shadow-container">
        <div className="container">
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
        {/* Solo mostrar el menú de productos si NO es admin */}
        {usuario.rol !== 'admin' && (
          <>
            <div className="menu-header">
              <img src={logo} alt="Menu Icon" className="menu-logo" />
              <h2 className="menu-title">MENÚ</h2>
            </div>
            {/* Filtrar productos por categoría */}
            <MenuCategory title="ENTRANTES" items={productos.filter(p => p.categoria === 'entrantes')} id="entrantes" onProductClick={setSelectedProduct} />
            <MenuCategory title="HAMBURGUESAS" items={productos.filter(p => p.categoria === 'hamburguesas')} id="burgers" onProductClick={setSelectedProduct} />
            <MenuCategory title="POSTRES" items={productos.filter(p => p.categoria === 'postres')} id="postres" onProductClick={setSelectedProduct} />
            {/* Botón para ver pedido */}
            <div style={{textAlign: 'center', margin: '32px 0'}}>
              <button 
                className="ver-pedido-btn-destacado"
                onClick={() => setPedidoVisible(true)}
              >
                Ver pedido
              </button>
            </div>
            {/* Modal del pedido */}
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
                          <span className="pedido-modal-item-price">{item.price}</span>
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
        {/* Nueva cabecera para Reservas o CRUD Reservas */}
        {usuario.rol === 'admin' ? (
          <>
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
                  // { key: "id", label: "ID" }, // oculto
                  { key: "nombre", label: "Nombre" },
                  { key: "email", label: "Email" },
                  { key: "fecha", label: "Fecha", format: v => v ? new Date(v).toLocaleDateString('es-ES') : '' },
                  { key: "hora", label: "Hora", format: v => v ? v.slice(0,5) : '' },
                  { key: "personas", label: "Personas" },
                  { key: "comentario", label: "Comentario" },
                  // { key: "usuarioId", label: "Usuario ID" }, // oculto
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
                  // { key: "id", label: "ID" }, // oculto
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
                  { key: "price", label: "Precio" },
                  { key: "description", label: "Descripción" },
                  { key: "image", label: "Imagen" },
                  { key: "modalImage", label: "Imagen real" },
                ]}
                addLabel="Añadir producto"
              />
            </div>
          </>
        ) : (
          <>
            <div className="menu-header reservas-header" id="reservas">
              <img src={logo} alt="Reservation Icon" className="menu-logo" />
              <h2 className="menu-title">RESERVAS</h2>
            </div>
            <ReservationSection />
            <CalendarSection />
            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToPedido={handleAddToPedido} />
          </>
        )}
      </main>

      {/* Apartado Último pedido o nada para admin */}
      {usuario.rol !== 'admin' && (
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
                      <span className="ticket-prod-precio">{prod.price}</span>
                    </div>
                  ))}
                </div>
                <hr className="ticket-hr" />
                <div className="ticket-total">
                  <span>Total:</span>
                  <span>{Number(ultimoTicket.total).toFixed(2)} €</span>
                </div>
                <div className="ticket-footer">¡Gracias por tu compra!</div>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', margin: '32px 0', color: '#e63946', fontFamily: 'Chewy, system-ui', fontSize: '1.3rem', fontWeight: 600}}>
              Haz tu primer pedido
            </div>
          )}
        </section>
      )}
      {/* Modal de perfil de usuario */}
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
              try {
                await api.put(`/users/${usuario.id}`, { nombre: editNombre, email: editEmail });
                setUsuario({ ...usuario, nombre: editNombre, email: editEmail });
                localStorage.setItem('usuario', JSON.stringify({ ...usuario, nombre: editNombre, email: editEmail }));
                setShowPerfilModal(false);
                setMensaje('Datos actualizados correctamente');
              } catch (err) {
                setMensaje('Error al actualizar los datos');
              }
            }}>
              <div className="perfil-modal-info" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontWeight: 600, color: '#222' }}>Nombre:
                  <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required minLength={2} />
                </label>
                <label style={{ fontWeight: 600, color: '#222' }}>Email:
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} required />
                </label>
                {/* Eliminar número de pedidos e historial para administradores */}
                {usuario.rol !== 'admin' && (
                  <div><b style={{ color: '#e63946' }}>Rol:</b> <span style={{ color: '#e63946', fontWeight: 700 }}>{usuario.rol}</span></div>
                )}
                {usuario.rol === 'admin' && (
                  <div><b style={{ color: '#e63946' }}>Rol:</b> <span style={{ color: '#e63946', fontWeight: 700 }}>admin</span></div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 18, justifyContent: 'center' }}>
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
            {/* Modal de confirmación de logout */}
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
                      setMensaje('Sesión cerrada');
                      setTimeout(() => setMensaje(''), 5000);
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
            {/* Modal historial de pedidos */}
            {showHistorial && (
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
                zIndex: 6000
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '32px 24px',
                  minWidth: 340,
                  maxWidth: 420,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  position: 'relative'
                }}>
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
                              <span className="ticket-prod-precio">{prod.price}</span>
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

// 3. Export principal con router
function AppWithRouter() {
  const [mensajeRegistro, setMensajeRegistro] = React.useState("");
  // Wrapper para usar useNavigate en rutas element
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
          // Navegar solo tras cerrar el modal (ahora lo hace la página)
          navigate("/");
        }}
      />
    );
  }
  function RegisterRouteWrapper(props) {
    const navigate = useNavigate();
    return <RegisterPage {...props} onRegister={(user) => {
      setMensajeRegistro('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      // Navegar solo tras cerrar el modal (ahora lo hace la página)
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

export default AppWithRouter;

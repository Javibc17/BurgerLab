import React, { useState, useEffect } from "react";
import "./CrudTable.css";
import eyeIcon from '../assets/proicons--eye.svg';
import eyeOffIcon from '../assets/proicons--eye-off.svg';

export default function CrudTableModal({
  open,
  onClose,
  onSave,
  initialData = {},
  columns = [],
  isEdit = false,
  title = "",
  deleteMode = false,
  deleteError // Agregado para recibir el mensaje de error de borrado
}) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Si no hay rol, poner 'cliente' por defecto al añadir
    if (open && !isEdit && (!initialData.rol || initialData.rol === '')) {
      setForm(f => ({ ...f, rol: 'cliente' }));
    } else {
      setForm(initialData);
    }
    setErrors({});
  }, [initialData, open, isEdit]);

  // Simple validation rules (customize as needed)
  const validate = () => {
    const newErrors = {};
    columns.forEach(col => {
      if (col.key === "email" && form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        newErrors.email = "Email no válido";
      }
      if (col.key === "nombre" && (!form.nombre || form.nombre.length < 2)) {
        newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
      }
      // Validaciones para productos
      if (endpointIsProducto()) {
        if (col.key === "categoria" && (!form.categoria || !['hamburguesas','entrantes','postres'].includes(form.categoria))) {
          newErrors.categoria = "Selecciona una categoría válida";
        }
        if (col.key === "title" && (!form.title || form.title.length < 2)) {
          newErrors.title = "El título debe tener al menos 2 caracteres";
        }
        if (col.key === "price" && (form.price === undefined || form.price === null || isNaN(Number(form.price)) || Number(form.price) <= 0)) {
          newErrors.price = "El precio debe ser un número positivo";
        }
        if (col.key === "description" && (!form.description || form.description.length < 2)) {
          newErrors.description = "La descripción debe tener al menos 2 caracteres";
        }
        if (col.key === "image" && (!form.image || form.image.length < 2)) {
          newErrors.image = "La imagen es obligatoria";
        }
      }
      if (col.key === "rol" && !form.rol && !endpointIsProducto() && !endpointIsReserva()) {
        newErrors.rol = "Selecciona un rol";
      }
    });
    // Validación de contraseña y confirmación SOLO al crear usuario
    if (!isEdit && !endpointIsReserva() && !endpointIsProducto()) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;
      if (!form.password || !passwordRegex.test(form.password)) {
        newErrors.password = "La contraseña debe tener más de 6 caracteres, al menos una mayúscula, un número y un símbolo";
      }
      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Confirma la contraseña";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  };

  if (!open) return null;

  // Si es modo borrado, mostrar confirmación personalizada
  if (deleteMode) {
    return (
      <div className="crud-modal-bg" onClick={onClose}>
        <div className="crud-modal" onClick={e => e.stopPropagation()}>
          <button className="crud-modal-close" onClick={onClose}>&times;</button>
          <h2 className="crud-modal-title">{title || 'Confirmar borrado'}</h2>
          <div style={{ fontSize: '1.15rem', color: '#e63946', fontWeight: 600, margin: '24px 0', textAlign: 'center' }}>
            ¿Seguro que quieres borrar este registro?
          </div>
          {/* Mostrar mensaje de error en rojo si existe deleteError */}
          {deleteError && (
            <div className="crud-modal-error" style={{
              background: '#fff',
              color: '#e63946',
              border: '2px solid #e63946',
              borderRadius: 8,
              padding: '7px 14px',
              margin: '12px 0',
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 2px 8px #e6394633',
              letterSpacing: 0.2,
              textAlign: 'center'
            }}>No se puede borrar este usuario porque tiene pedidos o reservas asociados. Debe eliminarlos primero.</div>
          )}
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 18 }}>
            <button className="del-btn" style={{ background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontFamily: 'Chewy, system-ui', fontSize: '1.15rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => onSave({ ...initialData, _delete: true })}>
              Borrar
            </button>
            <button type="button" className="del-btn" style={{ background: '#fff', color: '#e63946', border: '2px solid #e63946', borderRadius: 8, padding: '10px 24px', fontFamily: 'Chewy, system-ui', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper para saber si el endpoint es de reservas
  function endpointIsReserva() {
    // Si columns tiene una clave "fecha" y "personas" y no tiene "rol", es reserva
    const keys = columns.map(c => c.key);
    return keys.includes("fecha") && keys.includes("personas") && !keys.includes("rol");
  }

  // Helper para saber si el endpoint es de productos
  function endpointIsProducto() {
    const keys = columns.map(c => c.key);
    return keys.includes("categoria") && keys.includes("title") && keys.includes("price") && keys.includes("description") && keys.includes("image");
  }

  return (
    <div className="crud-modal-bg" onClick={onClose}>
      <div className="crud-modal" onClick={e => e.stopPropagation()}>
        <button className="crud-modal-close" onClick={onClose}>&times;</button>
        <h2 className="crud-modal-title">{title}</h2>
        <form onSubmit={handleSubmit} className="crud-modal-form">
          {/* Campos principales del formulario */}
          {columns.filter(col => {
            // Si el formulario es de productos, solo mostrar los campos clave
            if (endpointIsProducto()) {
              return [
                "categoria","title","price","description","image","modalImage"
              ].includes(col.key);
            }
            // Si el formulario es de reservas, ocultar password, confirmPassword y rol
            if ((col.key === "password" || col.key === "confirmPassword" || col.key === "rol") && endpointIsReserva()) {
              return false;
            }
            // Ocultar también el campo id en cualquier caso
            if (col.key === "id") return false;
            // Para usuarios, mostrar nombre y email (rol/password se fuerzan abajo)
            if (["nombre","email","fechaRegistro"].includes(col.key)) return true;
            return false;
          }).map(col => (
            <div className="crud-modal-field" key={col.key}>
              {endpointIsProducto() && col.key === "categoria" ? (
                <>
                  <label style={{ color: '#222' }}>Categoría<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
                  <select
                    name="categoria"
                    value={form.categoria || ''}
                    onChange={handleChange}
                    className={errors.categoria ? "error" : ""}
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="hamburguesas">Hamburguesas</option>
                    <option value="entrantes">Entrantes</option>
                    <option value="postres">Postres</option>
                  </select>
                  {errors.categoria && (
                    <div className="crud-modal-error" style={{
                      background: '#fff',
                      color: '#e63946',
                      border: '2px solid #e63946',
                      borderRadius: 8,
                      padding: '7px 14px',
                      marginTop: 6,
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: '0 2px 8px #e6394633',
                      letterSpacing: 0.2
                    }}>{errors.categoria}</div>
                  )}
                </>
              ) : (
                <>
                  <label style={{ color: '#222' }}>
                    {col.label}
                    {/* Asterisco en obligatorios de productos */}
                    {endpointIsProducto() && ["title","price","description","image"].includes(col.key) && (
                      <span style={{ color: '#e63946', marginLeft: 4 }}>*</span>
                    )}
                    {/* Asterisco en obligatorios de usuarios */}
                    {!endpointIsProducto() && ((col.key === "nombre") || (col.key === "email")) && (
                      <span style={{ color: '#e63946', marginLeft: 4 }}>*</span>
                    )}
                  </label>
                  <input
                    name={col.key}
                    value={form[col.key] ?? ""}
                    onChange={handleChange}
                    className={errors[col.key] ? "error" : ""}
                    type={col.key === "price" ? "number" : col.key === "email" ? "email" : "text"}
                    autoComplete="off"
                  />
                  {errors[col.key] && (
                    <div className="crud-modal-error" style={{
                      background: '#fff',
                      color: '#e63946',
                      border: '2px solid #e63946',
                      borderRadius: 8,
                      padding: '7px 14px',
                      marginTop: 6,
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: '0 2px 8px #e6394633',
                      letterSpacing: 0.2
                    }}>{errors[col.key]}</div>
                  )}
                </>
              )}
            </div>
          ))}
          {/* Campo contraseña (solo en crear usuario, usuarios) */}
          {!isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label style={{ color: '#222' }}>Contraseña<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <div style={{position:'relative', width:'100%'}}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  autoComplete="new-password"
                  style={{ width: '100%', paddingRight: 38 }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    outline: 'none',
                    height: 24,
                    width: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <img src={showPassword ? eyeOffIcon : eyeIcon} alt={showPassword ? 'Ocultar' : 'Mostrar'} style={{ width: 22, height: 22, opacity: 0.85, filter: 'invert(27%) sepia(86%) saturate(749%) hue-rotate(-10deg) brightness(95%) contrast(95%)' }} />
                </button>
              </div>
              {/* Barra de fuerza visual progresiva */}
              <div style={{ width: '100%', display: 'flex', gap: 6, margin: '8px 0 2px 0', height: 7 }}>
                {(() => {
                  const pwd = form.password || "";
                  const checks = [
                    /[A-Z]/.test(pwd), // mayúscula
                    /\d/.test(pwd),   // número
                    /[^A-Za-z0-9]/.test(pwd), // símbolo
                    pwd.length >= 7
                  ];
                  const passed = checks.filter(Boolean).length;
                  return [0,1,2,3].map(i => (
                    <div key={i} style={{
                      flex: 1,
                      height: 7,
                      borderRadius: 4,
                      background: i < passed ? '#43b96a' : '#e0e0e0',
                      transition: 'background 0.2s',
                    }} />
                  ));
                })()}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                Mínimo 7 caracteres, al menos una mayúscula, un número y un símbolo.
              </div>
              {errors.password && (
                <div className="crud-modal-error" style={{
                  background: '#fff',
                  color: '#e63946', // Fuerza rojo
                  border: '2px solid #e63946',
                  borderRadius: 8,
                  padding: '7px 14px',
                  marginTop: 6,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 2px 8px #e6394633',
                  letterSpacing: 0.2
                }}>{errors.password}</div>
              )}
            </div>
          )}
          {/* Confirmar contraseña (solo en crear usuario, usuarios) */}
          {!isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label style={{ color: '#222' }}>Confirmar contraseña<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <div style={{position:'relative', width:'100%'}}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword || ""}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                  autoComplete="new-password"
                  style={{ width: '100%', paddingRight: 38 }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    outline: 'none',
                    height: 24,
                    width: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <img src={showConfirmPassword ? eyeOffIcon : eyeIcon} alt={showConfirmPassword ? 'Ocultar' : 'Mostrar'} style={{ width: 22, height: 22, opacity: 0.85, filter: 'invert(27%) sepia(86%) saturate(749%) hue-rotate(-10deg) brightness(95%) contrast(95%)' }} />
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="crud-modal-error" style={{
                  background: '#fff',
                  color: '#e63946', // Fuerza rojo
                  border: '2px solid #e63946',
                  borderRadius: 8,
                  padding: '7px 14px',
                  marginTop: 6,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 2px 8px #e6394633',
                  letterSpacing: 0.2
                }}>{errors.confirmPassword}</div>
              )}
            </div>
          )}
          {/* Campo rol al final, solo en crear usuario, usuarios */}
          {!isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label style={{ color: '#222' }}>Rol<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <select
                name="rol"
                value={form.rol || "cliente"}
                onChange={handleChange}
                className={errors.rol ? "error" : ""}
              >
                <option value="cliente">cliente</option>
                <option value="admin">admin</option>
                <option value="empleado">empleado</option>
              </select>
              {errors.rol && (
                <div className="crud-modal-error" style={{
                  background: '#fff',
                  color: '#e63946', // Fuerza rojo
                  border: '2px solid #e63946',
                  borderRadius: 8,
                  padding: '7px 14px',
                  marginTop: 6,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 2px 8px #e6394633',
                  letterSpacing: 0.2
                }}>{errors.rol}</div>
              )}
            </div>
          )}
          <div className="crud-modal-actions">
            <button type="submit" className="edit-btn save-mode">
              Guardar
            </button>
            <button type="button" className="del-btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

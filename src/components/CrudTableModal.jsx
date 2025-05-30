import React, { useState, useEffect } from "react";
import "./CrudTable.css";
import eyeIcon from '../assets/proicons--eye.svg';
import eyeOffIcon from '../assets/proicons--eye-off.svg';
import { validarEmail, validarPassword, validarNombre } from '../utils/validaciones';
import { EXITOS } from '../utils/exitos';

export default function CrudTableModal({
  open,
  onClose,
  onSave,
  initialData = {},
  columns = [],
  isEdit = false,
  title = "",
  deleteMode = false,
  deleteError
}) {
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

  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open && !isEdit) {
      setForm({ rol: (!initialData.rol || initialData.rol === '') ? 'cliente' : initialData.rol });
    } else {
      let fecha = normalizeDateInput(initialData.fecha);
      if (isEdit && columns.some(c => c.key === 'fecha') && columns.some(c => c.key === 'personas') && !columns.some(c => c.key === 'rol') && fecha) {
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day);
        fechaObj.setDate(fechaObj.getDate() + 2);
        fecha = fechaObj.toISOString().slice(0, 10);
      }
      setForm(f => ({ ...initialData, fecha }));
    }
    setErrors({});
  }, [open, isEdit]);

  const validate = () => {
    const newErrors = {};
    if (!validarNombre(form.nombre)) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
    }
    if (!validarEmail(form.email)) {
      newErrors.email = "Introduce un email válido.";
    }
    if (endpointIsReserva()) {
      if (!form.fecha) {
        newErrors.fecha = "La fecha es obligatoria.";
      }
      if (!form.hora) {
        newErrors.hora = "La hora es obligatoria.";
      }
      if (!form.personas || isNaN(Number(form.personas))) {
        newErrors.personas = "Introduce un número válido de personas.";
      }
      if (!validarEmail(form.email)) {
        newErrors.email = "Introduce un email válido.";
      }
      if (!validarNombre(form.nombre)) {
        newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
      }
      if (form.fecha && form.hora) {
        const now = new Date();
        const reservaDateTime = new Date(`${form.fecha}T${form.hora}`);
        if (isNaN(reservaDateTime.getTime())) {
          newErrors.fecha = "Fecha u hora no válida.";
          newErrors.hora = "Fecha u hora no válida.";
        } else if (reservaDateTime < now) {
          newErrors.fecha = "No puedes reservar para una fecha u hora anterior a la actual.";
          newErrors.hora = "No puedes reservar para una fecha u hora anterior a la actual.";
        }
      }
      if (form.hora) {
        const [h, m] = form.hora.split(":").map(Number);
        const minutos = h * 60 + m;
        const enHorarioMediodia = minutos >= 13 * 60 && minutos < 16 * 60;
        const enHorarioNoche = minutos >= 20 * 60 && minutos < 24 * 60;
        if (!enHorarioMediodia && !enHorarioNoche) {
          newErrors.hora = "Solo puedes reservar entre 13:00-16:00 y 20:00-00:00.";
        }
      }
      const personasNum = Number(form.personas);
      if (!Number.isInteger(personasNum)) {
        newErrors.personas = "El número de personas debe ser un número entero.";
      } else if (personasNum < 1 || personasNum > 20) {
        newErrors.personas = "El número de personas debe estar entre 1 y 20.";
      }
    }
    if (!isEdit && !endpointIsReserva() && !endpointIsProducto()) {
      if (!validarPassword(form.password)) {
        newErrors.password = "La contraseña debe tener más de 6 caracteres, al menos una mayúscula, un número y un símbolo";
      }
      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Confirma la contraseña";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    if (!form.rol && !endpointIsProducto() && !endpointIsReserva()) {
      newErrors.rol = "Selecciona un rol";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    if (e.target.name === 'fecha') {
      setForm({ ...form, [e.target.name]: normalizeDateInput(e.target.value) });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  };

  if (!open) return null;

  if (deleteMode) {
    return (
      <div className="crud-modal-bg" onClick={onClose}>
        <div className="crud-modal" onClick={e => e.stopPropagation()}>
          <button className="crud-modal-close" onClick={onClose}>&times;</button>
          <h2 className="crud-modal-title">{title || 'Confirmar borrado'}</h2>
          <div style={{ fontSize: '1.15rem', color: '#e63946', fontWeight: 600, margin: '24px 0', textAlign: 'center' }}>
            ¿Seguro que quieres borrar este registro?
          </div>
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

  function endpointIsReserva() {
    const keys = columns.map(c => c.key);
    return keys.includes("fecha") && keys.includes("personas") && !keys.includes("rol");
  }

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
          {columns.filter(col => {
            if (endpointIsProducto()) {
              return [
                "categoria","title","price","description","image","modalImage"
              ].includes(col.key);
            }
            if (endpointIsReserva()) {
              return [
                "nombre","email","fecha","hora","personas","comentario"
              ].includes(col.key);
            }
            if (columns.some(c => c.key === 'estado') && columns.some(c => c.key === 'usuarioId')) {
              return col.key !== 'id';
            }
            if (["nombre","email","fechaRegistro"].includes(col.key)) return true;
            if (columns.some(c => c.key === 'numero') && columns.some(c => c.key === 'fecha') && columns.some(c => c.key === 'total')) {
              return [
                "numero","fecha","hora","total","usuarioId","productos"
              ].includes(col.key);
            }
            return false;
          }).map(col => {
            if (endpointIsReserva() && col.key === 'fecha') {
              return (
                <div className="crud-modal-field" key={col.key}>
                  <label style={{ color: '#222' }}>{col.label}<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
                  <input
                    name="fecha"
                    type="date"
                    value={form.fecha || ''}
                    onChange={handleChange}
                    className={errors.fecha ? "error" : ""}
                    required
                  />
                  {errors.fecha && (
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
                    }}>{errors.fecha}</div>
                  )}
                </div>
              );
            }
            if (endpointIsReserva() && col.key === 'hora') {
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
              const horasDisponibles = generarHorasDisponibles();
              return (
                <div className="crud-modal-field" key={col.key}>
                  <label style={{ color: '#222' }}>{col.label}<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
                  <select
                    name="hora"
                    value={form.hora || ''}
                    onChange={handleChange}
                    className={errors.hora ? "error" : ""}
                    required
                  >
                    <option value="">{form.hora ? `${form.hora}` : "Selecciona una hora"}</option>
                    {horasDisponibles.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {errors.hora && (
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
                    }}>{errors.hora}</div>
                  )}
                </div>
              );
            }
            if (endpointIsReserva() && col.key === 'personas') {
              return (
                <div className="crud-modal-field" key={col.key}>
                  <label style={{ color: '#222' }}>{col.label}<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
                  <input
                    name="personas"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={form.personas || 1}
                    onChange={handleChange}
                    className={errors.personas ? "error" : ""}
                    required
                  />
                  {errors.personas && (
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
                    }}>{errors.personas}</div>
                  )}
                </div>
              );
            }
            if (columns.some(c => c.key === 'numero') && columns.some(c => c.key === 'productos') && col.key === 'productos') {
              return (
                <div className="crud-modal-field" key={col.key}>
                  <label style={{ color: '#222' }}>{col.label || 'Productos'}<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
                  <textarea
                    name="productos"
                    value={Array.isArray(form.productos) ? form.productos.join(', ') : (form.productos || '')}
                    onChange={handleChange}
                    className={errors.productos ? "error" : ""}
                    required
                    rows={3}
                    placeholder="Lista de productos (separados por coma)"
                  />
                  {errors.productos && (
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
                    }}>{errors.productos}</div>
                  )}
                </div>
              );
            }
            return (
              <div className="crud-modal-field" key={col.key}>
                <label style={{ color: '#222' }}>
                  {col.label}
                  <span style={{ color: '#e63946', marginLeft: 4 }}>*</span>
                </label>
                <input
                  name={col.key}
                  value={form[col.key] ?? ""}
                  onChange={handleChange}
                  className={errors[col.key] ? "error" : ""}
                  type={col.key === "email" ? "email" : "text"}
                  autoComplete="off"
                  placeholder={col.label ? col.label : col.key}
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
              </div>
            );
          })}
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
                  placeholder="Contraseña"
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
              <div style={{ width: '100%', display: 'flex', gap: 6, margin: '8px 0 2px 0', height: 7 }}>
                {(() => {
                  const pwd = form.password || "";
                  const checks = [
                    /[A-Z]/.test(pwd),
                    /\d/.test(pwd),
                    /[^A-Za-z0-9]/.test(pwd),
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
                  placeholder="Confirmar contraseña"
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
          {!endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label style={{ color: '#222' }}>Rol<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <select
                name="rol"
                value={form.rol || "cliente"}
                onChange={handleChange}
                className={errors.rol ? "error" : ""}
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
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

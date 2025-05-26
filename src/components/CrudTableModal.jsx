import React, { useState, useEffect } from "react";
import "./CrudTable.css";

export default function CrudTableModal({
  open,
  onClose,
  onSave,
  initialData = {},
  columns = [],
  isEdit = false,
  title = "",
}) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

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
          {/* Detectar si es producto para mostrar solo los campos clave */}
          {columns.filter(col => {
            // Solo mostrar password, confirmPassword y rol al crear usuario
            if ((col.key === "password" || col.key === "confirmPassword" || col.key === "rol")) {
              // Solo si NO es reserva, NO es producto y NO es edición
              if (!endpointIsReserva() && !endpointIsProducto() && !isEdit) {
                return true;
              }
              return false;
            }
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
            return col.key !== "id" && col.key !== "password" && col.key !== "rol";
          }).map(col => (
            <div className="crud-modal-field" key={col.key}>
              <label>{col.label}{
                ((col.key === "nombre") || (col.key === "email")) && (
                  <span style={{ color: '#e63946', marginLeft: 4 }}>*</span>
                )
              }</label>
              {col.key === "categoria" && endpointIsProducto() ? (
                <select
                  name="categoria"
                  value={form.categoria || "entrantes"}
                  onChange={handleChange}
                  className={errors.categoria ? "error" : ""}
                >
                  <option value="entrantes">entrantes</option>
                  <option value="hamburguesas">hamburguesas</option>
                  <option value="postres">postres</option>
                </select>
              ) : col.key === "fecha" ? (
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha ? String(form.fecha).slice(0, 10) : ""}
                  onChange={handleChange}
                  className={errors.fecha ? "error" : ""}
                />
              ) : col.key === "description" && endpointIsProducto() ? (
                <textarea
                  name="description"
                  value={form.description ?? ""}
                  onChange={handleChange}
                  className={errors.description ? "error" : ""}
                  rows={5}
                  style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit', fontSize: 15, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e63946', background: '#fff', color: '#222', width: '100%' }}
                  placeholder="Descripción del producto (puedes usar varias líneas)"
                />
              ) : col.key === "modalImage" && endpointIsProducto() ? (
                <input
                  name="modalImage"
                  value={form.modalImage ?? ""}
                  onChange={handleChange}
                  className={errors.modalImage ? "error" : ""}
                  type="text"
                  placeholder="URL de la imagen real (opcional)"
                  style={{ fontFamily: 'inherit', fontSize: 15, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #1976d2', background: '#fff', color: '#222', width: '100%' }}
                />
              ) : (
                <input
                  name={col.key}
                  value={form[col.key] ?? ""}
                  onChange={handleChange}
                  className={errors[col.key] ? "error" : ""}
                />
              )}
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
          ))}
          {/* Campo contraseña (solo en crear usuario) */}
          {columns.some(col => col.key === "password") && !isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label>Contraseña<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <input
                type="password"
                name="password"
                value={form.password || ""}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                autoComplete="new-password"
              />
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                Mínimo 7 caracteres, al menos una mayúscula, un número y un símbolo.
              </div>
              {errors.password && (
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
                }}>{errors.password}</div>
              )}
            </div>
          )}
          {/* Confirmar contraseña (solo en crear usuario) */}
          {columns.some(col => col.key === "confirmPassword") && !isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label>Confirmar contraseña<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword || ""}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
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
                }}>{errors.confirmPassword}</div>
              )}
            </div>
          )}
          {/* Campo rol al final, solo en crear usuario */}
          {columns.some(col => col.key === "rol") && !isEdit && !endpointIsReserva() && !endpointIsProducto() && (
            <div className="crud-modal-field">
              <label>Rol<span style={{ color: '#e63946', marginLeft: 4 }}>*</span></label>
              <select
                name="rol"
                value={form.rol || "cliente"}
                onChange={handleChange}
                className={errors.rol ? "error" : ""}
              >
                <option value="admin">admin</option>
                <option value="empleado">empleado</option>
                <option value="cliente">cliente</option>
              </select>
              {errors.rol && (
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

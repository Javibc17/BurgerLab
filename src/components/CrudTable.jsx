import React, { useEffect, useState } from "react";
import api from "../api";
import "./CrudTable.css";
import CrudTableModal from "./CrudTableModal";

export default function CrudTable({ endpoint, columns, title, addLabel }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalInitial, setModalInitial] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // ahora es variable
  const [filters, setFilters] = useState(() => {
    // Leer filtros guardados en localStorage al iniciar
    try {
      const saved = localStorage.getItem(`crudtable-filters-${endpoint}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pendingFilters, setPendingFilters] = useState({});
  const [showAllFiltered, setShowAllFiltered] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [globalSearch, setGlobalSearch] = useState(""); // búsqueda general
  const [message, setMessage] = useState(""); // estado para el mensaje de éxito

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (e) {
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [endpoint]);

  const handleEdit = (row) => {
    setModalEdit(true);
    setModalInitial(row);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este registro?")) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
      setMessage("Registro eliminado correctamente");
    } catch {
      setError("Error eliminando registro");
    }
  };

  const handleModalSave = async (form) => {
    try {
      if (modalEdit) {
        let formToSend = { ...form };
        if (endpoint.includes('/reservas')) {
          const usuarioGuardado = localStorage.getItem('usuario');
          const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
          formToSend.usuarioId = user && user.id ? user.id : null;
          formToSend.comentario = typeof formToSend.comentario === 'string' ? formToSend.comentario : '';
          formToSend.nombre = formToSend.nombre ? String(formToSend.nombre) : '';
          formToSend.email = formToSend.email ? String(formToSend.email) : '';
          formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          formToSend.hora = formToSend.hora ? String(formToSend.hora).slice(0,5) : '';
          formToSend.personas = Number(formToSend.personas) || 1;
        }
        await api.put(`${endpoint}/${form.id}`, formToSend);
        setMessage("Registro editado correctamente");
      } else {
        // Eliminar confirmPassword antes de enviar al backend
        const { confirmPassword, ...formToSend } = form;
        if (endpoint.includes('/reservas')) {
          const usuarioGuardado = localStorage.getItem('usuario');
          const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
          formToSend.usuarioId = user && user.id ? user.id : null;
          formToSend.comentario = typeof formToSend.comentario === 'string' ? formToSend.comentario : '';
          formToSend.nombre = formToSend.nombre ? String(formToSend.nombre) : '';
          formToSend.email = formToSend.email ? String(formToSend.email) : '';
          formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          formToSend.hora = formToSend.hora ? String(formToSend.hora).slice(0,5) : '';
          formToSend.personas = Number(formToSend.personas) || 1;
        }
        await api.post(endpoint, formToSend);
        setMessage("Registro añadido correctamente");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setError("Error guardando cambios");
    }
  };

  const handleAdd = () => {
    setModalEdit(false);
    setModalInitial({});
    setModalOpen(true);
  };

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters(f => ({ ...f, [key]: value }));
  };

  const applyPendingFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
    // Guardar filtros en localStorage
    localStorage.setItem(`crudtable-filters-${endpoint}`, JSON.stringify(pendingFilters));
    setShowFilters(false); // Cierra el panel de filtros
  };

  const handleClearFilters = () => {
    setPendingFilters({});
    setFilters({});
    // Limpiar filtros en localStorage
    localStorage.removeItem(`crudtable-filters-${endpoint}`);
  };

  // Al abrir el filtro, sincroniza los valores actuales:
  useEffect(() => {
    if (showFilters) setPendingFilters(filters);
  }, [showFilters, filters]);

  // Cambia filteredData para usar filters, no pendingFilters
  const filteredData = data.filter(row => {
    const search = globalSearch.trim().toLowerCase();
    // Si hay búsqueda general, filtra por includes Y por los filtros de columna activos
    if (search !== "") {
      const matchGeneral = columns.filter(col => col.key !== 'id').some(col => {
        const val = row[col.key];
        return val && val.toString().toLowerCase().includes(search);
      });
      // Además, deben cumplirse los filtros de columna
      const matchColumnFilters = Object.entries(filters).every(([key, val]) => !val || (row[key] && row[key].toString().toLowerCase().startsWith(val.toLowerCase())));
      return matchGeneral && matchColumnFilters;
    }
    // Si no hay búsqueda general, solo aplica los filtros de columna
    return Object.entries(filters).every(([key, val]) => !val || (row[key] && row[key].toString().toLowerCase().startsWith(val.toLowerCase())))
  });

  // Hacer que la búsqueda general reinicie la paginación al escribir
  useEffect(() => {
    setPage(1);
  }, [globalSearch, filters]);

  // Guardar y restaurar búsqueda general en localStorage
  useEffect(() => {
    // Restaurar al cargar
    const saved = localStorage.getItem(`crudtable-globalsearch-${endpoint}`);
    if (saved) setGlobalSearch(saved);
  }, [endpoint]);

  useEffect(() => {
    // Guardar cada vez que cambia
    localStorage.setItem(`crudtable-globalsearch-${endpoint}` , globalSearch);
  }, [globalSearch, endpoint]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [data, totalPages, pageSize]);

  // Ocultar mensaje automáticamente después de 4 segundos
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  // Generar un id único para el select de paginación por tabla
  const pageSizeSelectId = `page-size-select-${endpoint.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="crud-table-container">
      {/* Mensaje arriba a la izquierda */}
      {message && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: 30,
          background: '#fff',
          color: '#2e7d32', // verde
          padding: '16px 38px',
          borderRadius: 12,
          fontSize: '1.2rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
          zIndex: 3000,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          border: '2px solid #2e7d32', // verde
        }}>
          {message}
        </div>
      )}
      <CrudTableModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        initialData={modalInitial}
        columns={columns.filter(col => col.key !== 'fechaRegistro')}
        isEdit={modalEdit}
        title={modalEdit ? `Editar ${addLabel?.replace('Añadir ', '') || ''}` : (!endpoint.includes('/reservas') && !endpoint.includes('/tickets') ? addLabel || 'Añadir' : '')}
      />
      <table className="crud-table crud-table-large" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.07)', padding: 0, width: '100%' }}>
        {/* Fila de controles: Buscar, Filtrar, Añadir */}
        <thead>
          <tr>
            <td colSpan={columns.length + 1} style={{ padding: 18, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                {/* Buscar */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 160, maxWidth: 240, flex: 1 }}>
                  <input
                    type="text"
                    className="crud-table-general-search-input"
                    placeholder="Buscar"
                    value={globalSearch}
                    onChange={e => setGlobalSearch(e.target.value)}
                    style={{
                      paddingLeft: 36,
                      paddingRight: 16,
                      height: 36,
                      borderRadius: 8,
                      border: '1.2px solid #1976d2',
                      fontSize: 15,
                      width: '100%',
                      background: '#f7faff',
                      color: '#222',
                      boxShadow: '0 1px 3px rgba(25,118,210,0.06)',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    aria-label="Búsqueda general"
                  />
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#1976d2' }}>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="7" stroke="#1976d2" strokeWidth="2" />
                      <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                {/* Filtrar */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="crud-table-search-btn"
                    style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '0 16px', boxSizing: 'border-box', background: '#1976d2', color: '#fff', border: '1.2px solid #1976d2' }}
                    onClick={() => setShowFilters(f => !f)}
                    aria-haspopup="true"
                    aria-expanded={showFilters}
                  >Filtrar ▼</button>
                  {showFilters && (
                    <>
                      <div
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 1999
                        }}
                        onClick={() => setShowFilters(false)}
                      />
                      <div
                        className="crud-table-filters-dropdown"
                        tabIndex={-1}
                        style={{
                          position: 'absolute',
                          top: '110%',
                          right: 0,
                          background: '#fff',
                          borderRadius: 12,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                          padding: '18px 18px 12px 18px',
                          zIndex: 2000,
                          minWidth: 320,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          animation: 'modalIn 0.22s cubic-bezier(0.4,0,0.2,1)'
                        }}
                      >
                        <button
                          onClick={() => setShowFilters(false)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'none',
                            border: 'none',
                            fontSize: 22,
                            color: '#e63946',
                            cursor: 'pointer',
                            fontWeight: 700,
                            zIndex: 2001
                          }}
                          aria-label="Cerrar filtros"
                          type="button"
                        >×</button>
                        {columns.filter(col => col.key !== 'id').map((col) => (
                          <div
                            key={col.key}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: 12
                            }}
                          >
                            <input
                              className="crud-table-filter-input"
                              type="text"
                              placeholder={`Buscar ${col.label}`}
                              value={pendingFilters[col.key] || ''}
                              onChange={e => handlePendingFilterChange(col.key, e.target.value)}
                              autoComplete="off"
                              style={{ flex: 1, textAlign: 'center', paddingRight: '24px', minWidth: 0 }}
                            />
                            {pendingFilters[col.key] && (
                              <button
                                type="button"
                                className="crud-table-filter-clear-x"
                                style={{
                                  position: 'absolute',
                                  right: 6,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  color: '#e63946',
                                  fontSize: 18,
                                  cursor: 'pointer',
                                  padding: 0,
                                  lineHeight: 1,
                                  height: '100%',
                                  width: 18
                                }}
                                onClick={() => handlePendingFilterChange(col.key, '')}
                                aria-label={`Limpiar filtro de ${col.label}`}
                              >×</button>
                            )}
                          </div>
                        ))}
                        <div style={{display:'flex',gap:10,marginTop:8, justifyContent:'center', alignItems:'center'}}>
                          <button className="crud-table-search-btn" style={{background:'#1976d2',color:'#fff',borderColor:'#1976d2', minWidth: 90, height: 36, fontSize: 15, borderRadius: 8}} onClick={applyPendingFilters}>Filtrar</button>
                          <button className="crud-table-filter-clear" style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, background:'#fff', color:'#1976d2', border:'1.2px solid #1976d2'}} onClick={handleClearFilters}>Limpiar</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Añadir */}
                {!endpoint.includes('/reservas') && !endpoint.includes('/tickets') && (
                  <button
                    className="crud-add-btn"
                    data-label={addLabel || 'Añadir'}
                    onClick={handleAdd}
                    style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '0 16px', boxSizing: 'border-box', background: '#1976d2', color: '#fff', border: '1.2px solid #1976d2' }}
                  >
                    +
                  </button>
                )}
              </div>
            </td>
          </tr>
          <tr>
            {columns.filter(col => col.key !== 'id').map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th style={{ minWidth: 120, textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', color: '#e63946', fontWeight: 500 }}>
                No hay resultados para los filtros actuales
              </td>
            </tr>
          ) : (
            paginatedData.map((row) => (
              <tr key={row.id}>
                {columns.filter(col => col.key !== 'id').map((col) => (
                  <td key={col.key}>
                    {col.format ? col.format(row[col.key], row || {}) : row[col.key]}
                  </td>
                ))}
                <td className="crud-table-actions" style={{ textAlign: 'center', justifyContent: 'center', display: 'flex', gap: 8 }}>
                  <button className="edit-btn" onClick={() => handleEdit(row)}>Editar</button>
                  <button className="del-btn" onClick={() => handleDelete(row.id)}>Borrar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
            <tr>
              <td colSpan={columns.length + 1} style={{padding: '14px 32px', background: '#fff'}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
                  {/* Izquierda: select de elementos por página */}
                  <div style={{ minWidth: 100, maxWidth: 120, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label htmlFor={pageSizeSelectId} style={{ fontSize: 15, color: '#222', whiteSpace: 'nowrap' }}>Elementos por página:</label>
                    <select
                      id={pageSizeSelectId}
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      style={{ borderRadius: 6, border: '1px solid #1976d2', fontSize: 15, padding: '2px 8px', background: '#f7faff', color: '#222', width: 60, appearance: 'menulist', WebkitAppearance: 'menulist', MozAppearance: 'menulist', zIndex: 10 }}
                      tabIndex={0}
                    >
                      {[5, 10, 25, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  {/* Centro: info de rango and paginación en la misma línea */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                    <span className="crud-table-pagination-info" style={{ fontSize: 15 }}>
                      Mostrando {filteredData.length === 0 ? 0 : ((page - 1) * pageSize + 1)}
                      -{Math.min(page * pageSize, filteredData.length)} de {filteredData.length}
                    </span>
                    <div className="crud-table-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => goToPage(page - 1)} disabled={page === 1}>&lt;</button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={page === i + 1 ? "active" : ""}
                          onClick={() => goToPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>&gt;</button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
      </table>
    </div>
  );
}

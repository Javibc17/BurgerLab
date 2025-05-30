import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
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
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem(`crudtable-pagesize-${endpoint}`);
    return saved ? Number(saved) : 5;
  }); // ahora es variable
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
  const [dropdownDirection, setDropdownDirection] = useState('down'); // 'down' o 'up'
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 320 });
  const filtrarBtnRef = useRef(null);
  const dropdownRef = useRef(null);
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
    // Mensaje personalizado en vez de confirm()
    setError("");
    setMessage("");
    // Mostrar modal de confirmación propio
    setModalEdit(false);
    setModalInitial({ id, _delete: true });
    setModalOpen(true);
  };

  const handleModalSave = async (form) => {
    try {
      if (form._delete && form.id) {
        // Borrado desde el modal con confirmación personalizada
        setError("");
        setMessage("");
        // Mostrar modal de confirmación propio
        try {
          await api.delete(`${endpoint}/${form.id}`);
          setMessage("Registro eliminado correctamente");
        } catch (err) {
          // Si es usuario, mostrar mensaje especial
          if (columns.some(col => col.key === 'rol')) {
            let customMsg = "No se puede eliminar este usuario porque tiene reservas o pedidos. Primero debe eliminarlos.";
            if (
              (err.response && err.response.status === 500) ||
              (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('tiene pedidos o reservas asociados'))
            ) {
              setMessage(customMsg);
            } else if (err.response && err.response.data && err.response.data.error) {
              setMessage(err.response.data.error);
            } else {
              setMessage(customMsg);
            }
            setError("");
          } else {
            let msg = "Error eliminando registro";
            if (err.response && err.response.data && err.response.data.error) {
              msg = err.response.data.error;
            }
            setMessage(msg);
            setError("");
          }
        }
        setModalOpen(false);
        fetchData();
        return;
      }
      if (modalEdit) {
        let formToSend = { ...form };
        if (endpoint.includes('/reservas') || endpoint.includes('/tickets')) {
          const usuarioGuardado = localStorage.getItem('usuario');
          const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
          formToSend.usuarioId = user && user.id ? user.id : null;
          formToSend.comentario = typeof formToSend.comentario === 'string' ? formToSend.comentario : '';
          formToSend.nombre = formToSend.nombre ? String(formToSend.nombre) : '';
          formToSend.email = formToSend.email ? String(formToSend.email) : '';
          // Guardar la fecha tal cual la selecciona el usuario, sin sumar días
          if (endpoint.includes('/reservas') && formToSend.fecha) {
            formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          } else {
            formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          }
          formToSend.hora = formToSend.hora ? String(formToSend.hora).slice(0,5) : '';
          formToSend.personas = Number(formToSend.personas) || 1;
        }
        await api.put(`${endpoint}/${form.id}`, formToSend);
        setMessage("Registro editado correctamente");
      } else {
        // Eliminar confirmPassword antes de enviar al backend
        const { confirmPassword, ...formToSend } = form;
        if (endpoint.includes('/reservas') || endpoint.includes('/tickets')) {
          const usuarioGuardado = localStorage.getItem('usuario');
          const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
          formToSend.usuarioId = user && user.id ? user.id : null;
          formToSend.comentario = typeof formToSend.comentario === 'string' ? formToSend.comentario : '';
          formToSend.nombre = formToSend.nombre ? String(formToSend.nombre) : '';
          formToSend.email = formToSend.email ? String(formToSend.email) : '';
          // Guardar la fecha tal cual la selecciona el usuario, sin sumar días
          if (endpoint.includes('/reservas') && formToSend.fecha) {
            formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          } else {
            formToSend.fecha = formToSend.fecha ? String(formToSend.fecha).slice(0,10) : '';
          }
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
    setModalInitial({ ...{} }); // Fuerza nueva referencia para reiniciar el modal
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
        // Si la columna es fecha, comparar en formato local
        if (col.key.toLowerCase().includes('fecha') && val) {
          const fechaLocal = new Date(val).toLocaleDateString('es-ES');
          return fechaLocal.includes(search);
        }
        return val && val.toString().toLowerCase().includes(search);
      });
      // Además, deben cumplirse los filtros de columna
      const matchColumnFilters = Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        if (key.toLowerCase().includes('fecha') && row[key]) {
          const fechaLocal = new Date(row[key]).toLocaleDateString('es-ES');
          return fechaLocal.startsWith(val);
        }
        return row[key] && row[key].toString().toLowerCase().startsWith(val.toLowerCase());
      });
      return matchGeneral && matchColumnFilters;
    }
    // Si no hay búsqueda general, solo aplica los filtros de columna
    return Object.entries(filters).every(([key, val]) => {
      if (!val) return true;
      if (key.toLowerCase().includes('fecha') && row[key]) {
        const fechaLocal = new Date(row[key]).toLocaleDateString('es-ES');
        return fechaLocal.startsWith(val);
      }
      return row[key] && row[key].toString().toLowerCase().startsWith(val.toLowerCase());
    });
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
    // Restaurar pageSize antes que page
    const savedPageSize = localStorage.getItem(`crudtable-pagesize-${endpoint}`);
    if (savedPageSize) setPageSize(Number(savedPageSize));
    // Restaurar página
    const savedPage = localStorage.getItem(`crudtable-page-${endpoint}`);
    if (savedPage) setPage(Number(savedPage));
  }, [endpoint]);

  useEffect(() => {
    // Guardar cada vez que cambia
    localStorage.setItem(`crudtable-globalsearch-${endpoint}` , globalSearch);
  }, [globalSearch, endpoint]);

  useEffect(() => {
    localStorage.setItem(`crudtable-page-${endpoint}`, page);
  }, [page, endpoint]);

  useEffect(() => {
    localStorage.setItem(`crudtable-pagesize-${endpoint}`, pageSize);
  }, [pageSize, endpoint]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  // Estado para ordenación
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' o 'desc'

  // Función para manejar el click en el encabezado
  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
    // Ya NO cambiamos la página al ordenar, se mantiene la actual
  };

  // Ordenar los datos antes de paginar
  const sortedData = React.useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortCol] ?? '';
      const bVal = b[sortCol] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
        : String(bVal).localeCompare(String(aVal), 'es', { numeric: true });
    });
  }, [filteredData, sortCol, sortDir]);

  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);
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

  // Efecto para ajustar la dirección y posición absoluta del dropdown de filtros
  useEffect(() => {
    if (showFilters && filtrarBtnRef.current) {
      const btnRect = filtrarBtnRef.current.getBoundingClientRect();
      let width = Math.max(320, btnRect.width);
      let dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 240;
      const spaceBelow = window.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;
      let direction = 'down';
      let top = btnRect.bottom + 4;
      if (spaceBelow < dropdownHeight + 12 && spaceAbove > dropdownHeight + 12) {
        direction = 'up';
        top = btnRect.top - dropdownHeight - 4;
      }
      setDropdownDirection(direction);
      setDropdownPos({
        top: Math.max(8, top),
        left: btnRect.right - width,
        width
      });
    }
  }, [showFilters]);

  // Persistir ordenación en localStorage
  useEffect(() => {
    if (sortCol) {
      localStorage.setItem(`crudtable-sortcol-${endpoint}`, sortCol);
      localStorage.setItem(`crudtable-sortdir-${endpoint}`, sortDir);
    }
  }, [sortCol, sortDir, endpoint]);
  // Restaurar ordenación al cargar
  useEffect(() => {
    const savedCol = localStorage.getItem(`crudtable-sortcol-${endpoint}`);
    const savedDir = localStorage.getItem(`crudtable-sortdir-${endpoint}`);
    if (savedCol) setSortCol(savedCol);
    if (savedDir) setSortDir(savedDir);
  }, [endpoint]);

  return (
    <div className="crud-table-container">
      {/* Mensaje arriba a la izquierda */}
      {message && (
        <div style={{
          position: 'fixed',
          top: 30,
          left: 30,
          background: '#fff',
          color: (/eliminar|eliminarlos|error|conflict/i.test(message)) ? '#e63946' : '#2e7d32',
          WebkitTextFillColor: (/eliminar|eliminarlos|error|conflict/i.test(message)) ? '#e63946' : '#2e7d32',
          MozTextFillColor: (/eliminar|eliminarlos|error|conflict/i.test(message)) ? '#e63946' : '#2e7d32',
          textShadow: (/eliminar|eliminarlos|error|conflict/i.test(message)) ? '0 0 1px #e63946' : undefined,
          border: `2.5px solid ${/eliminar|eliminarlos|error|conflict/i.test(message) ? '#e63946' : '#2e7d32'}`,
          padding: '18px 48px 18px 22px',
          borderRadius: 14,
          fontSize: '1.18rem',
          fontFamily: 'Chewy, system-ui',
          fontWeight: 600,
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
          <span style={{fontSize: 26, marginRight: 6, display: 'flex', alignItems: 'center'}}>
            {/eliminar|eliminarlos|error|conflict/i.test(message)
              ? <span style={{color:'#e63946'}}>&#9888;</span> // exclamación
              : <span style={{color:'#2e7d32'}}>&#10003;</span> // check
            }
          </span>
          <span style={{flex:1, color: /eliminar|eliminarlos|error|conflict/i.test(message) ? '#e63946' : '#2e7d32', WebkitTextFillColor: /eliminar|eliminarlos|error|conflict/i.test(message) ? '#e63946' : '#2e7d32', MozTextFillColor: /eliminar|eliminarlos|error|conflict/i.test(message) ? '#e63946' : '#2e7d32', textShadow: /eliminar|eliminarlos|error|conflict/i.test(message) ? '0 0 1px #e63946' : undefined }}>{message}</span>
          <button
            onClick={() => setMessage("")}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 22,
              fontWeight: 700,
              marginLeft: 10,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
              transition: 'color 0.2s',
              borderRadius: 4
            }}
            aria-label="Cerrar mensaje"
            tabIndex={0}
            onMouseOver={e => e.currentTarget.style.color = '#e63946'}
            onMouseOut={e => e.currentTarget.style.color = '#888'}
          >×</button>
        </div>
      )}
      <CrudTableModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        initialData={modalInitial}
        columns={columns.filter(col => col.key !== 'fechaRegistro')}
        isEdit={modalEdit}
        title={modalInitial._delete ? 'Confirmar borrado' : (modalEdit ? `Editar ${addLabel?.replace('Añadir ', '') || ''}` : (!endpoint.includes('/reservas') && !endpoint.includes('/tickets') ? addLabel || 'Añadir' : ''))}
        deleteMode={modalInitial._delete || false}
      />
      <table className="crud-table crud-table-large" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.07)', padding: 0, width: '100%' }}>
        {/* Fila de controles: Buscar, Filtrar, Añadir */}
        <thead>
          <tr>
            <td colSpan={columns.length + 1} style={{ padding: 18, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
                {/* Buscar a la izquierda */}
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
                {/* Filtrar y Añadir a la derecha */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', position: 'relative', zIndex: 100 }}>
                  <button
                    className="crud-table-search-btn"
                    style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '0 16px', boxSizing: 'border-box', background: '#fff', color: '#1976d2', border: '1.2px solid #1976d2' }}
                    onClick={e => { e.stopPropagation(); setShowFilters(v => !v); }}
                    aria-haspopup="true"
                    aria-expanded={showFilters}
                    type="button"
                    id="crud-table-filtrar-btn"
                    ref={filtrarBtnRef}
                  >Filtrar ▼</button>
                  {/* Dropdown de filtros usando portal para sobresalir la tabla */}
                  {showFilters && ReactDOM.createPortal(
                    <div
                      className="crud-table-filters-dropdown"
                      tabIndex={-1}
                      ref={dropdownRef}
                      style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                        padding: '18px 18px 12px 18px',
                        zIndex: 3000,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        animation: 'modalIn 0.22s cubic-bezier(0.4,0,0.2,1)'
                      }}
                      onClick={e => e.stopPropagation()}
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
                      {columns.filter(col => col.key !== 'id' && col.key !== 'modalImage' && col.key !== 'imagen').map((col) => (
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
                        <button className="crud-table-search-btn" style={{background:'#1976d2',color:'#fff',borderColor:'#1976d2', minWidth: 90, height: 36, fontSize: 15, borderRadius: 8}} onClick={applyPendingFilters} type="button">Filtrar</button>
                        <button className="crud-table-filter-clear" style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, background:'#fff', color:'#1976d2', border:'1.2px solid #1976d2'}} onClick={handleClearFilters} type="button">Limpiar</button>
                      </div>
                    </div>,
                    document.body
                  )}
                  {!endpoint.includes('/reservas') && !endpoint.includes('/tickets') && (
                    <button
                      className="crud-add-btn"
                      data-label={addLabel || 'Añadir'}
                      onClick={handleAdd}
                      style={{ minWidth: 90, height: 36, fontSize: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '0 16px', boxSizing: 'border-box', background: '#1976d2', color: '#fff', border: '1.2px solid #1976d2' }}
                      type="button"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            {columns.filter(col => col.key !== 'id').map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{ cursor: 'pointer', userSelect: 'none', color: sortCol === col.key ? '#1976d2' : '#222', fontWeight: sortCol === col.key ? 700 : 500, position: 'relative', paddingRight: 8 }}
              >
                {col.label}
                {sortCol === col.key && (
                  <span style={{ marginLeft: 2, color: '#1976d2', fontSize: 16, position: 'static', verticalAlign: 'middle' }}>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
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
                  <td key={col.key} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(col.key === 'modalImage' || col.key === 'imagen') && row[col.key]
                      ? row[col.key] // Mostrar la ruta como texto
                      : (col.format
                          ? col.format(row[col.key], row || {})
                          : (typeof row[col.key] === 'string' && row[col.key].length > 32
                              ? row[col.key].slice(0, 32) + '...'
                              : row[col.key]))}
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
                    <span className="crud-table-pagination-info" style={{ fontSize: 15, color: '#1976d2', fontWeight: 600 }}>
                      Mostrando <span style={{color:'#1976d2',fontWeight:700}}>{filteredData.length === 0 ? 0 : ((page - 1) * pageSize + 1)}</span>
                      -<span style={{color:'#1976d2',fontWeight:700}}>{Math.min(page * pageSize, filteredData.length)}</span> de <span style={{color:'#1976d2',fontWeight:700}}>{filteredData.length}</span>
                    </span>
                    <div className="crud-table-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => goToPage(page - 1)} disabled={page === 1}>&lt;</button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={page === i + 1 ? "active" : ""}
                          style={page === i + 1 ? { background: '#1976d2', color: '#fff', fontWeight: 700, border: '1.5px solid #1976d2' } : {}}
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

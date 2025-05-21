// 1. Imports
import React from "react";

// 2. Componente principal
function Pedido({ pedido, total, onRemove, onConfirm, divSize }) {
  return (
    <aside className="pedido-lista" style={{
      background: '#fff',
      color: '#e63946',
      borderRadius: 12,
      padding: 32,
      minWidth: divSize === 'grande' ? 520 : 280,
      maxWidth: divSize === 'grande' ? 700 : 420,
      width: '100%',
      boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      margin: '0 auto', // Centrado horizontal
      position: 'static', // Elimina absolute para que fluya con el contenido
      left: 'unset',
      top: 'unset',
      zIndex: 10
    }}>
      <h3 style={{textAlign: 'center', marginBottom: 18, color: '#e63946'}}>Tu Pedido</h3>
      {pedido.length === 0 ? (
        <p style={{textAlign: 'center', color: '#e63946'}}>No has añadido productos.</p>
      ) : (
        <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
          {pedido.map((item, idx) => (
            <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <button 
                style={{marginRight: 12, background: '#e63946', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontWeight: 'bold'}} 
                onClick={() => onRemove(idx)} 
                title="Eliminar"
              >✕</button>
              <span>{item.title}</span>
              <span>{item.price}</span>
            </li>
          ))}
        </ul>
      )}
      <hr style={{margin: '18px 0', borderColor: '#e63946'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#e63946'}}>
        <span>Total:</span>
        <span>{total.toFixed(2)} €</span>
      </div>
      {pedido.length > 0 && (
        <button
          style={{
            marginTop: 24,
            width: '100%',
            background: '#e63946',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontSize: '1.15rem',
            fontFamily: 'Chewy, system-ui',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(230,57,70,0.10)'
          }}
          onClick={onConfirm}
        >
          Realizar pedido
        </button>
      )}
    </aside>
  );
}

// 3. Export
export default Pedido;

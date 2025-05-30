import React from "react";
import "../App.css";

function Pedido({ pedido, total, onRemove, onConfirm, divSize }) {
  return (
    <aside className={`pedido-lista${divSize === 'grande' ? ' pedido-lista-grande' : ''}`}>
      <h3 className="pedido-lista-title">Tu Pedido</h3>
      {pedido.length === 0 ? (
        <p className="pedido-lista-vacio">No has añadido productos.</p>
      ) : (
        <ul className="pedido-lista-ul">
          {pedido.map((item, idx) => (
            <li key={idx} className="pedido-lista-item">
              <button 
                className="pedido-lista-remove" 
                onClick={() => onRemove(idx)} 
                title="Eliminar"
              >✕</button>
              <span className="pedido-lista-item-title">{item.title}</span>
              <span className="pedido-lista-item-price">{String(item.price).includes('€') ? item.price : `${item.price} €`}</span>
            </li>
          ))}
        </ul>
      )}
      <hr className="pedido-lista-hr" />
      <div className="pedido-lista-total">
        <span>Total:</span>
        <span>{total.toFixed(2)} €</span>
      </div>
      {pedido.length > 0 && (
        <>
          <button
            className="pedido-lista-confirm"
            onClick={onConfirm}
          >
            Realizar pedido
          </button>
          <button
            className="pedido-lista-descargar"
            style={{marginTop: 12, background: '#e63946', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #e6394633'}}
            onClick={() => descargarTicketPedido(pedido, total)}
          >
            Descargar ticket
          </button>
        </>
      )}
    </aside>
  );
}

function descargarTicketPedido(pedido, total) {
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString();
  const horaStr = fecha.toLocaleTimeString();
  let contenido = '';
  contenido += '        BURGERLAB\n';
  contenido += '   Av. de la Hamburguesa 123\n';
  contenido += '      Tel: 622 833 777\n';
  contenido += '------------------------------\n';
  contenido += `Fecha: ${fechaStr}  Hora: ${horaStr}\n`;
  contenido += '------------------------------\n';
  contenido += 'Cant  Producto           Precio\n';
  contenido += '------------------------------\n';
  pedido.forEach((item, i) => {
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
  contenido += `TOTAL:${total.toFixed(2).padStart(21,' ')} €\n`;
  contenido += '------------------------------\n';
  contenido += '   ¡Gracias por tu pedido!\n';
  contenido += '        www.burgerlab.com\n';
  contenido += '------------------------------\n';
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket_pedido_burgerlab_${fecha.getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export default Pedido;

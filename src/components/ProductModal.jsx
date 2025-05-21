// 1. Imports
import React from "react";
import "../App.css";

// 2. Componente principal
function ProductModal({ product, onClose, onAddToPedido }) {
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-flex-v2">
          <img src={product.modalImage || product.image} alt={product.title} className="modal-img modal-img-large" />
          <div className="modal-info-v2">
            <h2 className="modal-title modal-title-v2 modal-title-center-large" style={{textAlign: 'center', width: '100%'}}>{product.title}</h2>
            {product.description && (
              <div className="modal-desc-block-v2">
                {product.description.split(/\n\n/).map((block, i, arr) => {
                  const isLast = i === arr.length - 1;
                  if (/^Ingredientes:/i.test(block)) {
                    return (
                      <div key={i} className="modal-formula-block">
                        <h3 className="modal-section-title">Ingredientes</h3>
                        <p className="modal-desc-text">{block.replace(/^Ingredientes:\s*/i, '')}</p>
                      </div>
                    );
                  }
                  if (/^Presentación:/i.test(block) || /^Hábitat natural:/i.test(block)) {
                    return (
                      <div key={i} className="modal-formula-block">
                        <h3 className="modal-section-title">Habitat Natural</h3>
                        <p className="modal-desc-text">{block.replace(/^Presentación:\s*|^Hábitat natural:\s*/i, '')}</p>
                      </div>
                    );
                  }
                  if (/^F[óo]rmula:/i.test(block)) {
                    return (
                      <div key={i} className="modal-formula-block">
                        <h3 className="modal-section-title">Fórmula</h3>
                        <p className="modal-desc-text">{block.replace(/^F[óo]rmula:\s*/i, '')}</p>
                        {isLast && (
                          <div className="modal-bottom-row modal-bottom-row-horizontal">
                            <span className="modal-price modal-price-v2">{product.price}</span>
                            <button className="modal-add-btn" onClick={() => onAddToPedido(product)}>Añadir al pedido</button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (isLast) {
                    return (
                      <div key={i}>
                        <p className="modal-desc-text">{block}</p>
                        <div className="modal-bottom-row modal-bottom-row-horizontal">
                          <span className="modal-price modal-price-v2">{product.price}</span>
                          <button className="modal-add-btn" onClick={() => onAddToPedido(product)}>Añadir al pedido</button>
                        </div>
                      </div>
                    );
                  }
                  return <p key={i} className="modal-desc-text">{block}</p>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Export
export default ProductModal;

import React from "react";
import "../App.css";

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
                          <div className="modal-bottom-row modal-bottom-row-horizontal" style={{gap: 16}}>
                            <span className="modal-price modal-price-v2">{String(product.price).includes('€') ? product.price : `${product.price} €`}</span>
                            <button
                              className="modal-add-btn ver-pedido-btn-destacado"
                              style={{
                                padding: '0 24px',
                                fontSize: '1.4rem',
                                borderRadius: '8px',
                                marginLeft: 0,
                                minWidth: 0,
                                height: 48,
                                alignSelf: 'center',
                                boxShadow: 'none',
                                background: '#f4c2c2',
                                color: '#e63946',
                                border: '3px solid #e63946',
                                fontWeight: 'bold',
                                fontFamily: 'Chewy, system-ui',
                                transition: 'background 0.18s, color 0.18s, border 0.18s',
                                animation: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onClick={() => onAddToPedido(product)}
                              onMouseOver={e => {
                                e.currentTarget.style.background = '#e63946';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = '#f4c2c2';
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = '#f4c2c2';
                                e.currentTarget.style.color = '#e63946';
                                e.currentTarget.style.borderColor = '#e63946';
                              }}
                            >
                              Añadir al pedido
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (isLast) {
                    return (
                      <div key={i}>
                        <p className="modal-desc-text">{block}</p>
                        <div className="modal-bottom-row modal-bottom-row-horizontal" style={{gap: 16}}>
                          <span className="modal-price modal-price-v2">{String(product.price).includes('€') ? product.price : `${product.price} €`}</span>
                          <button
                            className="modal-add-btn ver-pedido-btn-destacado"
                            style={{
                              padding: '0 24px',
                              fontSize: '1.4rem',
                              borderRadius: '8px',
                              marginLeft: 0,
                              minWidth: 0,
                              height: 48,
                              alignSelf: 'center',
                              boxShadow: 'none',
                              background: '#f4c2c2',
                              color: '#e63946',
                              border: '3px solid #e63946',
                              fontWeight: 'bold',
                              fontFamily: 'Chewy, system-ui',
                              transition: 'background 0.18s, color 0.18s, border 0.18s',
                              animation: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => onAddToPedido(product)}
                            onMouseOver={e => {
                              e.currentTarget.style.background = '#e63946';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.borderColor = '#f4c2c2';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.background = '#f4c2c2';
                              e.currentTarget.style.color = '#e63946';
                              e.currentTarget.style.borderColor = '#e63946';
                            }}
                          >
                            Añadir al pedido
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return <p key={i} className="modal-desc-text">{block}</p>;
                })}
              </div>
            )}
            {((product && (product.categoria === 'entrantes' || product.categoria === 'postres')) && !product.description) && (
              <div className="modal-desc-block-v2">
                <p className="modal-desc-text" style={{ fontSize: '1.08rem', color: '#b03535', marginBottom: 12 }}>
                  {product.categoria === 'entrantes' && (
                    product.title === 'Patatas' ? 'Clásicas patatas fritas doradas.' :
                    product.title === 'Ensalada' ? 'Ensalada fresca con ingredientes de temporada.' :
                    product.title === 'Nachos' ? 'Nachos crujientes con queso y salsas.' :
                    product.title === 'Alitas de Pollo' ? 'Alitas de pollo marinadas y crujientes.' : ''
                  )}
                  {product.categoria === 'postres' && (
                    product.title === 'Tarta de Queso' ? 'Tarta cremosa de queso con base de galleta.' :
                    product.title === 'Tarta de Pantera Rosa' ? 'Bizcocho rosa relleno de crema, sabor a infancia.' :
                    product.title === 'Tarta de Pistacho' ? 'Tarta de pistacho suave y deliciosa.' :
                    product.title === 'Tarta del Día' ? 'Tarta casera del día, pregúntanos por el sabor!' : ''
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;

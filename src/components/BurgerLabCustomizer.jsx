import React, { useState } from "react";
import { INGREDIENTES_BURGER_LAB } from "../data/ingredientesBurgerLab";
import burgerLabImage from "../assets/hamburguesas/burgeralbblanconegro-removebg-preview.png";

const PRECIO_BASE = 8.5;
const PRECIO_EXTRA = 1.0;

function BurgerLabCustomizer({ onAddToPedido }) {
  const [seleccion, setSeleccion] = useState({
    pan: INGREDIENTES_BURGER_LAB.pan[0],
    carne: INGREDIENTES_BURGER_LAB.carne[0],
    queso: INGREDIENTES_BURGER_LAB.queso[0],
    salsas: INGREDIENTES_BURGER_LAB.salsas[0],
    extras: []
  });

  const handleChange = (tipo, valor) => {
    if (tipo === "extras") {
      setSeleccion((prev) => ({
        ...prev,
        extras: prev.extras.includes(valor)
          ? prev.extras.filter((e) => e !== valor)
          : [...prev.extras, valor]
      }));
    } else {
      setSeleccion((prev) => ({ ...prev, [tipo]: valor }));
    }
  };

  const precioFinal = (PRECIO_BASE + seleccion.extras.length * PRECIO_EXTRA).toFixed(2);

  const handleAdd = () => {
    if (onAddToPedido) {
      onAddToPedido({
        title: "Burger Lab personalizada",
        ingredientes: { ...seleccion },
        price: `${precioFinal} €`
      });
    }
  };

  return (
    <div className="modal-flex-v2">
      <img
        src={burgerLabImage}
        alt="Burger Lab"
        className="modal-img modal-img-large"
        style={{ background: '#fff', border: 'none' }}
      />
      <div className="modal-info-v2">
        <h2 className="modal-title modal-title-v2 modal-title-center-large" style={{ textAlign: 'center', width: '100%' }}>
          Burger Lab
        </h2>
        <div className="modal-desc-block-v2">
          <p className="modal-desc-text" style={{ fontSize: '1.08rem', color: '#b03535', marginBottom: 12 }}>
            ¡Elige tus ingredientes y crea tu propia Burger Lab!
          </p>
        </div>
        <form style={{ marginBottom: 18 }}>
          <div>
            <label>Pan:</label>
            {INGREDIENTES_BURGER_LAB.pan.map((p) => (
              <label key={p} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="pan"
                  value={p}
                  checked={seleccion.pan === p}
                  onChange={() => handleChange("pan", p)}
                />
                {p}
              </label>
            ))}
          </div>
          <div>
            <label>Carne:</label>
            {INGREDIENTES_BURGER_LAB.carne.map((c) => (
              <label key={c} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="carne"
                  value={c}
                  checked={seleccion.carne === c}
                  onChange={() => handleChange("carne", c)}
                />
                {c}
              </label>
            ))}
          </div>
          <div>
            <label>Queso:</label>
            {INGREDIENTES_BURGER_LAB.queso.map((q) => (
              <label key={q} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="queso"
                  value={q}
                  checked={seleccion.queso === q}
                  onChange={() => handleChange("queso", q)}
                />
                {q}
              </label>
            ))}
          </div>
          <div>
            <label>Salsas:</label>
            {INGREDIENTES_BURGER_LAB.salsas.map((s) => (
              <label key={s} style={{ marginRight: 10 }}>
                <input
                  type="radio"
                  name="salsas"
                  value={s}
                  checked={seleccion.salsas === s}
                  onChange={() => handleChange("salsas", s)}
                />
                {s}
              </label>
            ))}
          </div>
          <div>
            <label>Extras:</label>
            {INGREDIENTES_BURGER_LAB.extras.map((e) => (
              <label key={e} style={{ marginRight: 10 }}>
                <input
                  type="checkbox"
                  name="extras"
                  value={e}
                  checked={seleccion.extras.includes(e)}
                  onChange={() => handleChange("extras", e)}
                />
                {e}
              </label>
            ))}
          </div>
        </form>
        <div className="burgerlab-preview">
          <h3 style={{ marginBottom: 6 }}>Tu Burger Lab:</h3>
          <ul style={{ marginBottom: 8 }}>
            <li><b>Pan:</b> {seleccion.pan}</li>
            <li><b>Carne:</b> {seleccion.carne}</li>
            <li><b>Queso:</b> {seleccion.queso}</li>
            <li><b>Salsas:</b> {seleccion.salsas}</li>
            <li><b>Extras:</b> {seleccion.extras.length > 0 ? seleccion.extras.join(", ") : "Ninguno"}</li>
          </ul>
          <div className="modal-bottom-row modal-bottom-row-horizontal">
            <span className="modal-price modal-price-v2">{precioFinal} €</span>
            <button type="button" onClick={handleAdd} className="modal-add-btn ver-pedido-btn-destacado" style={{ marginLeft: 16 }}>
              Añadir al pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BurgerLabCustomizer;

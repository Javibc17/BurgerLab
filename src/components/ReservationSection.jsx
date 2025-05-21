// 1. Imports
import React from "react";
import mesaReserva from "../assets/MesaReserva.png"; // Verifica que esta ruta sea correcta

// 2. Componente principal
function ReservationSection() {
  return (
    <section className="reservation-section">
      <div className="reservation-container">
        <div className="reservation-image">
          <img src={mesaReserva} alt="Mesa de reserva" />
        </div>
        <div className="reservation-form-container">
          <h3 className="reservation-title">Reserva una Mesa</h3>
          <form className="reservation-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" name="name" placeholder="Tu nombre" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input type="email" id="email" name="email" placeholder="Tu correo" required />
            </div>
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input type="date" id="date" name="date" required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Hora</label>
              <input type="time" id="time" name="time" required />
            </div>
            <button type="submit" className="reservation-button">Reservar</button>
          </form>
        </div>
      </div>
    </section>
  );
}

// 3. Export
export default ReservationSection;
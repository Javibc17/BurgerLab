function Reservations() {
  return (
    <section id="reservations">
      <h2>Reservas</h2>
      <p>¡Reserva tu mesa ahora y disfruta de la mejor experiencia en BurgerLab!</p>
      <form className="reservation-form">
        <label htmlFor="name">Nombre:</label>
        <input type="text" id="name" name="name" placeholder="Tu nombre" required />
        
        <label htmlFor="date">Fecha:</label>
        <input type="date" id="date" name="date" required />
        
        <label htmlFor="time">Hora:</label>
        <input type="time" id="time" name="time" required />
        
        <label htmlFor="guests">Número de personas:</label>
        <input type="number" id="guests" name="guests" min="1" max="20" required />
        
        <button type="submit">Reservar</button>
      </form>
    </section>
  );
}

export default Reservations;
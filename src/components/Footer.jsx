import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <section className="footer-section">
          <h4>Información de contacto</h4>
          <p>Dirección: Calle Ejemplo 123, Ciudad, País</p>
          <p>Teléfono: +34 123 456 789</p>
          <p>Correo: contacto@burgerlab.com</p>
          <p>Horario: Lunes a Domingo, 12:00 - 23:00</p>
        </section>

        <section className="footer-section">
          <h4>Enlaces importantes</h4>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#sobre-nosotros">Sobre nosotros</a></li>
            <li><a href="#productos">Servicios / Productos</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#faq">Preguntas frecuentes</a></li>
          </ul>
        </section>

        <section className="footer-section">
          <h4>Redes sociales</h4>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> |
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> |
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">X</a>
          </div>
        </section>

        <section className="footer-section">
          <h4>Políticas legales</h4>
          <ul>
            <li><a href="#aviso-legal">Aviso legal</a></li>
            <li><a href="#politica-privacidad">Política de privacidad</a></li>
            <li><a href="#politica-cookies">Política de cookies</a></li>
            <li><a href="#terminos-condiciones">Términos y condiciones</a></li>
          </ul>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Burger Lab. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;

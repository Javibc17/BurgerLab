import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <section className="footer-section">
          <h4>Información de contacto</h4>
          <p>Teléfono: +34 622 833 777</p>
          <p>Correo: contacto@burgerlab.com</p>
          
        </section>

        <section className="footer-section">
          <h4>Enlaces importantes</h4>
          <ul style={{ fontWeight: 'normal' }}>
            <li><a href="#inicio">Menú</a></li>
            <li><a href="#reservas">Reservas</a></li>
            <li><a href="#mis-pedidos">Último pedido</a></li>
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

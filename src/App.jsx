import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Menu from './components/Menu';
import Reservations from './components/Reservations'; // Importa el nuevo componente

function App() {
  return (
    <>
      <Header />
      <main>
        <Menu />
        <section id="about">
          <h2>Sobre Nosotros</h2>
          <p>En BurgerLab, nos especializamos en crear las mejores hamburguesas con ingredientes frescos y de alta calidad.</p>
        </section>
        <Reservations /> {/* Usa el nuevo componente */}
        <section id="contact">
          <h2>Contacto</h2>
          <p>Email: contacto@burgerlab.com</p>
          <p>Teléfono: +1 234 567 890</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default App;

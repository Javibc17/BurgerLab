import React from "react";
import "./App.css";
import logoLetras from "./assets/logoLetras.png"; // Importa el logo correctamente
import logo from "./assets/logo.png"; // Importa el logo correctamente
import nachosImage from "./assets/nachos-removebg-preview.png";
import alitasImage from "./assets/alitas-removebg-preview.png";

function App() {
  return (
    <div className="App">
      <div className="shadow-container">
        <div className="container">
          <nav className="navbar">
            <ul className="nav-links">
              <li>Inicio</li>
              <li>Burgers</li>
              <li>Entrantes</li>
              <li>Postres</li>
            </ul>
          </nav>
          <div className="content">
            <div className="logo">
              <img
                src={logoLetras} // Usa la variable importada correctamente
                alt="Burger Lab Logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nueva sección del menú */}
      <div className="menu-section">
        <div className="menu-header">
          <img
            src={logo} 
            alt="Menu Icon"
            className="menu-logo"
          />
          <h2 className="menu-title">MENÚ</h2>
        </div>

        {/* Div para Entrantes */}
        <div className="menu-categories entrantes">
          <div className="menu-category">
            <h3 className="category-title">ENTRANTES</h3>
            <div className="menu-items-container">
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1046/1046786.png"
                  alt="Patatas"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Patatas</h4>
                </div>
                <span className="menu-item-price">3,00 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1046/1046786.png"
                  alt="Ensalada"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Ensalada</h4>
                </div>
                <span className="menu-item-price">4,50 €</span>
              </div>
              <div className="menu-item">
                <img
                  src={nachosImage} // Usa la imagen importada
                  alt="Nachos"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Nachos</h4>
                </div>
                <span className="menu-item-price">5,00 €</span>
              </div>
              <div className="menu-item">
                <img
                  src={alitasImage} // Usa la imagen importada
                  alt="Alitas de Pollo"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Alitas de Pollo</h4>
                </div>
                <span className="menu-item-price">6,50 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Div para Hamburguesas */}
        <div className="menu-categories hamburguesas">
          <div className="menu-category">
            <h3 className="category-title">HAMBURGUESAS</h3>
            <div className="menu-items-container">
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="Clásica"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Clásica</h4>
                  <p>Elige tus ingredientes</p>
                </div>
                <span className="menu-item-price">8,50 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="Queso"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Queso</h4>
                  <p>con patatas</p>
                </div>
                <span className="menu-item-price">9,00 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="Picante"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Picante</h4>
                  <p>con patatas</p>
                </div>
                <span className="menu-item-price">9,50 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="Vegana"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Vegana</h4>
                  <p>con aguacate</p>
                </div>
                <span className="menu-item-price">10,00 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="BBQ"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>BBQ</h4>
                  <p>con salsa barbacoa</p>
                </div>
                <span className="menu-item-price">10,50 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                  alt="Doble Carne"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Doble Carne</h4>
                  <p>con extra de queso</p>
                </div>
                <span className="menu-item-price">12,00 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Div para Postres */}
        <div className="menu-categories postres">
          <div className="menu-category">
            <h3 className="category-title">POSTRES</h3>
            <div className="menu-items-container">
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1046/1046787.png"
                  alt="Helado"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Helado</h4>
                </div>
                <span className="menu-item-price">3,50 €</span>
              </div>
              <div className="menu-item">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1046/1046788.png"
                  alt="Tarta"
                  className="menu-item-image"
                />
                <div className="menu-item-info">
                  <h4>Tarta</h4>
                </div>
                <span className="menu-item-price">4,00 €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
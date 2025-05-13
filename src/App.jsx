import React from "react";
import "./App.css";
import logo from "./assets/logo.png";
import logoLetras from "./assets/logoLetras.png";
import MenuCategory from "./components/MenuCategory";
import Footer from "./components/Footer";
import { menu } from "./data/menuData";

function App() {
  return (
    <div className="App">
      <header className="shadow-container">
        <div className="container">
          <nav className="navbar">
            <ul className="nav-links">
              <li><a href="#inicio">Menú</a></li>
              <li><a href="#entrantes">Entrantes</a></li>
              <li><a href="#burgers">Hamburguesas</a></li>
              <li><a href="#postres">Postres</a></li>
            </ul>
          </nav>
          <div className="content">
            <div className="logo">
              <img src={logoLetras} alt="Burger Lab Logo" />
            </div>
          </div>
        </div>
      </header>

      <main className="menu-section" id="inicio">
        <div className="menu-header">
          <img src={logo} alt="Menu Icon" className="menu-logo" />
          <h2 className="menu-title">MENÚ</h2>
        </div>

        <MenuCategory title="ENTRANTES" items={menu.entrantes} id="entrantes" />
        <MenuCategory title="HAMBURGUESAS" items={menu.hamburguesas} id="burgers" />
        <MenuCategory title="POSTRES" items={menu.postres} id="postres" />
      </main>

      <Footer />
    </div>
  );
}

export default App;

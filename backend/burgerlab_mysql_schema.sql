-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('cliente','admin','empleado') DEFAULT 'cliente',
  fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(50),
  title VARCHAR(100),
  price VARCHAR(20),
  description TEXT,
  image VARCHAR(255)
);

-- Tabla de tickets (pedidos)
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT,
  numero INT,
  fecha DATE,
  hora TIME,
  total DECIMAL(10,2),
  FOREIGN KEY (usuarioId) REFERENCES users(id)
);

-- Tabla de productos en cada ticket
CREATE TABLE ticket_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT,
  productoId INT,
  title VARCHAR(100),
  price VARCHAR(20),
  FOREIGN KEY (ticketId) REFERENCES tickets(id),
  FOREIGN KEY (productoId) REFERENCES productos(id)
);

-- Tabla de reservas
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT,
  nombre VARCHAR(100),
  email VARCHAR(100),
  fecha DATE,
  hora TIME,
  personas INT,
  comentario VARCHAR(200),
  FOREIGN KEY (usuarioId) REFERENCES users(id)
);

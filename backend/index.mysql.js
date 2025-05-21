// Backend Node.js con MySQL para BurgerLab
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión MySQL
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'burgerLab',
  port: process.env.MYSQL_PORT || 3306
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('BurgerLab API con MySQL funcionando 🚀');
});

// Endpoint: crear usuario
app.post('/api/users', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const allowedRoles = ['cliente', 'admin', 'empleado'];
  const userRole = rol || 'cliente';
  // Validaciones backend
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Introduce un email válido.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser cliente, admin o empleado.' });
  }
  try {
    // Si la contraseña no está hasheada, la hasheamos aquí
    const isHash = password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
    const hashedPassword = isHash ? password : await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, userRole]
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol: userRole });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint: listar usuarios
app.get('/api/users', async (req, res) => {
  const [rows] = await db.execute('SELECT id, nombre, email, rol, fechaRegistro FROM users');
  res.json(rows);
});

// Endpoint: login de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT id, nombre, email, password, rol FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const user = rows[0];
    // Comparar la contraseña hasheada
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: crear producto
app.post('/api/productos', async (req, res) => {
  const { categoria, title, price, description, image } = req.body;
  const [result] = await db.execute(
    'INSERT INTO productos (categoria, title, price, description, image) VALUES (?, ?, ?, ?, ?)',
    [categoria, title, price, description, image]
  );
  res.status(201).json({ id: result.insertId, categoria, title, price, description, image });
});

// Endpoint: listar productos
app.get('/api/productos', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM productos');
  res.json(rows);
});

// Endpoint: crear ticket (pedido)
app.post('/api/tickets', async (req, res) => {
  const { usuarioId, numero, fecha, hora, productos, total } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [ticketResult] = await conn.execute(
      'INSERT INTO tickets (usuarioId, numero, fecha, hora, total) VALUES (?, ?, ?, ?, ?)',
      [usuarioId || null, numero, fecha, hora, total]
    );
    const ticketId = ticketResult.insertId;
    // Insertar productos del ticket
    for (const prod of productos) {
      await conn.execute(
        'INSERT INTO ticket_productos (ticketId, productoId, title, price) VALUES (?, ?, ?, ?)',
        [ticketId, prod.productoId || null, prod.title, prod.price]
      );
    }
    await conn.commit();
    res.status(201).json({ id: ticketId, numero, fecha, hora, productos, total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Endpoint: listar tickets
app.get('/api/tickets', async (req, res) => {
  const [tickets] = await db.execute('SELECT * FROM tickets ORDER BY id DESC');
  for (const ticket of tickets) {
    const [productos] = await db.execute('SELECT title, price FROM ticket_productos WHERE ticketId = ?', [ticket.id]);
    ticket.productos = productos;
  }
  res.json(tickets);
});

// Endpoint: crear reserva
app.post('/api/reservas', async (req, res) => {
  const { usuarioId, nombre, email, fecha, hora, personas, comentario } = req.body;
  const [result] = await db.execute(
    'INSERT INTO reservas (usuarioId, nombre, email, fecha, hora, personas, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuarioId || null, nombre, email, fecha, hora, personas, comentario]
  );
  res.status(201).json({ id: result.insertId, nombre, email, fecha, hora, personas, comentario });
});

// Endpoint: listar reservas
app.get('/api/reservas', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM reservas ORDER BY id DESC');
  res.json(rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend BurgerLab MySQL escuchando en puerto ${PORT}`));

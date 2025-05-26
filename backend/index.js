// Backend BurgerLab solo para MySQL
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: '*', // Permitir cualquier origen para depuración
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Configuración MySQL
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'burgerlab',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ENDPOINTS USUARIOS
app.post('/api/users', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const allowedRoles = ['cliente', 'admin', 'empleado'];
  const userRole = rol || 'cliente';
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Introduce un email válido.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser cliente, admin o empleado.' });
  }
  try {
    const isHash = password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
    const hashedPassword = isHash ? password : await bcrypt.hash(password, 10);
    console.log('HASH DEBUG:', password, '->', hashedPassword); // DEBUG
    const [result] = await db.execute(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, userRole]
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol: userRole });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ENDPOINT LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nombre, email, rol, fechaRegistro FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT ACTUALIZAR USUARIO
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Introduce un email válido.' });
  }
  try {
    const [result] = await db.execute(
      'UPDATE users SET nombre = ?, email = ? WHERE id = ?',
      [nombre, email, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ id, nombre, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ENDPOINTS TICKETS
app.post('/api/tickets', async (req, res) => {
  const { usuarioId, numero, fecha, hora, productos, total } = req.body;
  if (!usuarioId || !numero || !fecha || !hora || !Array.isArray(productos) || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos de ticket incompletos.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO tickets (usuarioId, numero, fecha, hora, productos, total) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId, numero, fecha, hora, JSON.stringify(productos), total]
    );
    res.status(201).json({ id: result.insertId, usuarioId, numero, fecha, hora, productos, total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    let query = `
      SELECT tickets.id, tickets.usuarioId, users.nombre AS usuarioNombre, tickets.numero, tickets.fecha, tickets.hora, tickets.productos, tickets.total
      FROM tickets
      LEFT JOIN users ON tickets.usuarioId = users.id
    `;
    let params = [];
    if (req.query.usuarioId) {
      query += ' WHERE tickets.usuarioId = ?';
      params.push(req.query.usuarioId);
    }
    query += ' ORDER BY tickets.id DESC';
    const [rows] = await db.execute(query, params);
    // Parsear productos de JSON a objeto
    const tickets = rows.map(t => ({ ...t, productos: JSON.parse(t.productos) }));
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINTS RESERVAS
app.post('/api/reservas', async (req, res) => {
  const { nombre, email, fecha, hora, personas, comentario, usuarioId } = req.body;
  if (!nombre || !email || !fecha || !hora || !personas) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para la reserva.' });
  }
  // Asegura que usuarioId sea null o un número válido
  const userIdValue = usuarioId !== undefined && usuarioId !== '' ? Number(usuarioId) : null;
  console.log('Reserva recibida:', { nombre, email, fecha, hora, personas, comentario, usuarioId });
  try {
    // CORREGIDO: el orden de los campos debe coincidir con la tabla (usuarioId primero)
    const [result] = await db.execute(
      'INSERT INTO reservas (usuarioId, nombre, email, fecha, hora, personas, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userIdValue, nombre, email, fecha, hora, personas, comentario || '']
    );
    res.status(201).json({ id: result.insertId, nombre, email, fecha, hora, personas, comentario });
  } catch (err) {
    console.error('Error en POST /api/reservas:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/reservas', async (req, res) => {
  console.log('GET /api/reservas llamado con query:', req.query); // <-- LOG INICIAL
  try {
    let query = 'SELECT id, nombre, email, fecha, hora, personas, comentario, usuarioId FROM reservas';
    let params = [];
    if (req.query.usuarioId) {
      // Fuerza a número para evitar problemas de tipo
      query += ' WHERE usuarioId = ?';
      params.push(Number(req.query.usuarioId));
      console.log('Buscando reservas para usuarioId:', Number(req.query.usuarioId));
    }
    query += ' ORDER BY fecha DESC, hora DESC';
    const [rows] = await db.execute(query, params);
    console.log('Reservas encontradas:', rows); // <-- LOG DETALLADO
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/reservas:', err);
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT ACTUALIZAR RESERVA
app.put('/api/reservas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, fecha, hora, personas, comentario, usuarioId } = req.body;
  if (!nombre || !email || !fecha || !hora || !personas) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para la reserva.' });
  }
  try {
    const [result] = await db.execute(
      'UPDATE reservas SET nombre=?, email=?, fecha=?, hora=?, personas=?, comentario=?, usuarioId=? WHERE id=?',
      [nombre, email, fecha, hora, personas, comentario, usuarioId, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }
    res.json({ id, nombre, email, fecha, hora, personas, comentario, usuarioId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ENDPOINTS CRUD PRODUCTOS
app.post('/api/productos', async (req, res) => {
  const { categoria, title, price, description, image, modalImage } = req.body;
  const [result] = await db.execute(
    'INSERT INTO productos (categoria, title, price, description, image, modalImage) VALUES (?, ?, ?, ?, ?, ?)',
    [categoria, title, price, description, image, modalImage]
  );
  res.status(201).json({ id: result.insertId, categoria, title, price, description, image, modalImage });
});

app.get('/api/productos', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM productos');
  res.json(rows);
});

app.put('/api/productos/:id', async (req, res) => {
  const { categoria, title, price, description, image, modalImage } = req.body;
  const { id } = req.params;
  await db.execute(
    'UPDATE productos SET categoria=?, title=?, price=?, description=?, image=?, modalImage=? WHERE id=?',
    [categoria, title, price, description, image, modalImage, id]
  );
  res.json({ id, categoria, title, price, description, image, modalImage });
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM productos WHERE id=?', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend BurgerLab (MySQL) escuchando en puerto ${PORT}`));

// Backend BurgerLab solo para MySQL
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
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
    let query = 'SELECT id, usuarioId, numero, fecha, hora, productos, total FROM tickets';
    let params = [];
    if (req.query.usuarioId) {
      query += ' WHERE usuarioId = ?';
      params.push(req.query.usuarioId);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await db.execute(query, params);
    // Parsear productos de JSON a objeto
    const tickets = rows.map(t => ({ ...t, productos: JSON.parse(t.productos) }));
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aquí puedes añadir los endpoints de tickets, reservas y productos usando MySQL si los necesitas

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend BurgerLab (MySQL) escuchando en puerto ${PORT}`));

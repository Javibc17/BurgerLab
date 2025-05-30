const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nombre: String,
  email: String,
  fecha: String, // YYYY-MM-DD
  hora: String,  // HH:mm
  personas: Number,
  comentario: String
});

module.exports = mongoose.model('Reserva', reservaSchema);

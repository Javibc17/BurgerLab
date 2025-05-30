const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  categoria: String,
  title: String,
  price: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Producto', productoSchema);

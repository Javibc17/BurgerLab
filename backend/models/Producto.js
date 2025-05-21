// Modelo de producto para BurgerLab
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  categoria: String, // hamburguesas, entrantes, postres, etc.
  title: String,
  price: String,
  description: String,
  image: String
});

module.exports = mongoose.model('Producto', productoSchema);

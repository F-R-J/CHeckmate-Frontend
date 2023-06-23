const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ID: String,
  name: String,
  email: String,
  password: String,
})

module.exports = new mongoose.model('login', loginSchema, 'logins');
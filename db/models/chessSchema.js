const mongoose = require('mongoose');

const chessSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ID: String,
  uid: String,
})

module.exports = new mongoose.model('chess', chessSchema, 'chesss');
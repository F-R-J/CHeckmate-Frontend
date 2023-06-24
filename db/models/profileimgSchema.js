const mongoose = require('mongoose');

const profileimgSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  uid: String,
  img: String,
})

module.exports = new mongoose.model('profileimg', profileimgSchema, 'profileimgs');
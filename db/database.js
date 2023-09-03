// const mysql = require("mysql");
// const database = mysql.createConnection({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE,
// });
// database.connect(function (err) {
//   if (err) throw err;
//   //console.log("Database Connected Successfully...");
// });
// module.exports = database;

const mongoose = require('mongoose');
const dotenv = require("dotenv")

dotenv.config();

module.exports = {
  init: () => {
    const dbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
      poolSize: 5,
      connectTimeoutMS: 10000,
      family: 4
    };

    mongoose.connect(process.env.MONGO_URL, dbOptions);
    mongoose.set('useFindAndModify', false);
    mongoose.Promise = global.Promise;
    mongoose.connection.on('connected', () => {
      console.log('the site has connected to the database');
    })
    mongoose.connection.on('disconnected', () => {
      console.log('the site has disconnected from the database');
    })
    mongoose.connection.on('err', (err) => {
      console.log('There is a error' + err);
    })
  }
}

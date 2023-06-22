const mysql = require("mysql");
const database = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
database.connect(function (err) {
  if (err) throw err;
  //console.log("Database Connected Successfully...");
});
module.exports = database;

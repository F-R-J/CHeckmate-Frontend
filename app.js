const express = require("express");
const path = require("path");
const mysql = require("mysql");
const fileupload = require('express-fileupload')

require("dotenv").config({
  path: "./.env",
});

const nodemailer = require("nodemailer");
const session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

const app = express();

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.use(fileupload())
app.use(express.static('uploads'));


var options = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
};

var connection = mysql.createConnection(options);
var sessionStore = new MySQLStore(
  {
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
      tableName: "sessiontbl",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  connection
);

app.use(
  session({
    key: "checkmate",
    secret: "sdp@checkmate",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    },
  })
);

// Parsing josn body
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// View engine
app.set("view engine", "hbs");

// defining routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

const port = process.env.PORT || 5001;

app.listen(port, (err) => {
  if (err) {
    //console.log(err);
  } else {
    console.log(`app start at http://localhost:${port}`);
  }
});

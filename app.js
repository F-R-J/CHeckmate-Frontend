const express = require("express");
const path = require("path");
const db = require('./db/database') 
const fileupload = require('express-fileupload')

require("dotenv").config({
  path: "./.env",
});

const nodemailer = require("nodemailer");
const session = require("express-session");
var MySQLStore = require('connect-mongo')(session);

const app = express();

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.use(fileupload())
app.use(express.static('uploads'));


app.use(
  session({
    key: "checkmate",
    secret: "sdp@checkmate",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    },
    store: new MySQLStore({
      url: 'mongodb+srv://arrahat777:beaking12@mernfirst.k4myuar.mongodb.net/techNotesDB?retryWrites=true&w=majority', //YOUR MONGODB URL
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native'
  })
  })
);

// app.use(session(
//   secret: 'SECRET KEY',
//   resave: false,
//   saveUninitialized: true,
  
// ))



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
db.init();

const port = process.env.PORT || 5001;

app.listen(port, (err) => {
  if (err) {
    //console.log(err);
  } else {
    console.log(`app start at http://localhost:${port}`);
  }
});

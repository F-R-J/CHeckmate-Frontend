//external modules
const express = require("express");
const path = require("path");
const db = require('./db/database')
const fileupload = require('express-fileupload')
const dotenv = require("dotenv")
const session = require("express-session");
var MySQLStore = require('connect-mongo')(session);

// internal modules
dotenv.config({
  path: "./.env",
});

// initializing express
const app = express();

// static files
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.use(fileupload())
app.use(express.static('uploads'));

// session config
app.use(
  session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 86400000
    },
    store: new MySQLStore({
      url: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native'
    })
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
db.init();

const port = process.env.PORT || 5001;

// starting server
app.listen(port, (err) => {
  if (err) {
    //console.log(err);
  } else {
    console.log(`app start at http://localhost:${port}`);
  }
});

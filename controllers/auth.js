// external modules
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const USER = require("../db/models/loginSchema");
const Pimg = require("../db/models/profileimgSchema");
const Chess = require("../db/models/chessSchema");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");

dotenv.config();

// const e = require("express");
// const db = require("../db/database");
//const jwt = require("jsonwebtoken");
//const express = require("express");
//const async = require("hbs/lib/async");
//const router = express.Router()

// signup controller
exports.signup = async (req, res) => {
  var cnt1 = 0;
  const { name, email, id, password, passwordConfirm } = req.body;

  let user = await USER.findOne({ email: email });
  if (user) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "This email is already in use.",
    });
  } else if (password !== passwordConfirm) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "Passwords do not match.",
    });
  } else if (password.length < 8) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "Password must be 8 characters long.",
    });
  } else {
    cnt1 = 1;
  }


  let userID = await USER.findOne({ ID: id });
  if (userID) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "This username is already taken.",
    });
  } else if (cnt1 == 1) {
    let hashedPassword = await bcrypt.hash(password, 8);

    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    let transporter = nodemailer.createTransport({
      service: process.env.SERVICE_NAME,
      auth: {
        user: process.env.GMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: process.env.GMAIL_RESET,
      text: process.env.GMAIL_MESSAGE + OTP,
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
      } else {
        const user = {
          name,
          id,
          email,
          OTP,
          pass: hashedPassword,
        };

        const data = JSON.stringify(user);

        fs.writeFile("./user.json", data, (err) => {
          if (err) {
            //console.log(err);
          } else {
            //console.log("Data saved");
          }
        });
        res.redirect('/verify')
      }
    });
  }
}


async function setuser(user, next) {
  let User = await new USER({
    _id: mongoose.Types.ObjectId(),
    ID: user.id,
    name: user.name,
    email: user.email,
    password: user.pass
  });
  await User.save().catch((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("User saved");
      next();
    }
  });
}

async function setpimg(user, next) {
  let PIMG = await new Pimg({
    _id: mongoose.Types.ObjectId(),
    uid: user.id,
    img: ''
  })
  await PIMG.save().catch((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Profile image saved");
      next();
    }
  });
}


exports.verify = async (req, res) => {
  //console.log(req.body);
  const { OTP } = req.body;
  fs.readFile("user.json", "utf-8", async (err, data) => {
    if (err) {
      //console.log(err);
    } else {
      const user = JSON.parse(data.toString());
      if (user.OTP === OTP) {
        console.log("OTP verified");
        await setuser(user);
        await setpimg(user);
        delete req.session.msg;
        res.redirect('/login')
      } else {
        req.session.msg = 'Incorrect OTP!!'
        res.redirect('/verify')
      }
    }
  });
};


exports.login = async (req, res) => {
  const { email_username, password, remember } = req.body;

  if (remember == "yes") {
    //console.log("remembered");
  }

  let email = await USER.findOne({ email: email_username });
  let uID = await USER.findOne({ ID: email_username });

  if (!email && !uID) {
    req.session.msg = "Email or Username doesn't exist";
    return res.redirect('/login')
  }
  else {
    let user;
    if (email) {
      user = email;
    }
    else {
      user = uID;
    }
    // console.log(user);


    bcrypt.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        req.session.uid = user.ID;
        if (remember == "yes") {
          req.session.isAuth = true;
        } else {
          req.session.isAuth = false;
        }
        req.session.canSee = true;



        var cookies=(function(str){ 
          var result={};
          str.split(/;\s+/).forEach(function(e){
            var parts=e.split(/=/,2);
            result[parts[0]]=parts[1]||'';
          });
          return result;
        })(req.headers.cookie),
        sessionCookieName='checkmate',
        sessionId=cookies[sessionCookieName]||'nothing';
        sessionId = sessionId.slice(4).trim();
        var idd = sessionId.split('.',2);

        let chess = new Chess({
          _id: mongoose.Types.ObjectId(),
          ID: idd[0],
          uid: user.ID
        })
        chess.save().then((result) => {
          console.log(result);
        }).catch((err) => {
          console.log(err);
        })
        
        res.redirect('/homepage')
      }
      else {
        req.session.msg = "Invalid Password!";
        return res.redirect('/login')
      }
    })
  }
}


exports.homepage = (req, res) => {
  res.render("homepage", {
    layout: "layouts/homeLayout",
    id: req.session.uid
  });
};

exports.chessgame = (req, res) => {
  //console.log(req.body);
};

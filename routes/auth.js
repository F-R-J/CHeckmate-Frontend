require("dotenv").config();
const express = require("express");
const authcontroller = require("../controllers/auth");
const db = require('../db/database');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const e = require("express");
const USER = require("../db/models/loginSchema");
const Pimg = require("../db/models/profileImgSchema");

const router = express.Router();

router.post("/signup", authcontroller.signup);
router.post("/verify", authcontroller.verify);
router.post("/login", authcontroller.login);
router.post("/homepage", authcontroller.homepage);
router.post("/chessgame", authcontroller.chessgame);


router.post('/verify_email', (req, res) => {
  //console.log('aise');
  const email = req.body.email;
  USER.find({ email: email }, (err, result) => {
    if (err) {
      //console.log(err);
      res.redirect('/forgotpassword')
    } else {
      if (result.length > 0) {

        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "checkmate.sdp@gmail.com",
            pass: "chietjvndhjaugpn",
          },
        });

        let mailOptions = {
          from: "checkmate.sdp@gmail.com",
          to: email,
          subject: "Verification code for reset password.",
          text: "Your OTP is : " + OTP,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            //console.log(error);
          } else {
            //console.log("Email sent: " + info.response);
            req.session.email = email;
            req.session.OTP = OTP;
            res.redirect('/verify1')
          }
        });
      }
      else {
        res.redirect('/forgotpassword')
      }
    }
  })
})

router.post('/verify1', (req, res) => {
  const otp = req.body.OTP;
  ////console.log(req.body)
  if (otp === req.session.OTP) {
    delete req.session.msg
    req.session.reset = true;
    res.redirect('/resetpassword')
  }
  else {
    req.session.msg = 'Wrong otp!! try again';
    res.redirect('/verify1')
  }
})

router.post('/changepass', (req, res) => {
  const { opass, npass, ncpass } = req.body;
  USER.findOne({ ID: req.session.uid }, async (error, result) => {
    if (error) {
      console.log(error)
      res.redirect('/profile')
    }
    try {
      const doMatch = await bcrypt.compare(opass, result.password);
      if (doMatch) {
        if (npass !== ncpass) {
          req.session.msg = 'New password do not matched try again';
          return res.redirect('/profile');
        }
        if (npass.length < 8) {
          req.session.msg = 'New password must be 8 character long';
          return res.redirect('/profile');
        }
        delete req.session.msg;

        const hashedpass = await bcrypt.hash(npass, 8);

        USER.updateOne({ ID: req.session.uid }, { $set: { password: hashedpass } }, (err, result) => {
          if (err) {
            console.error(err);
            req.session.msg = 'Something went wrong, please try again';
            return res.redirect('/profile');
          }
          return res.redirect('/profile');
        });
      } else {
        req.session.msg = 'Old password does not match, please try again';
        return res.redirect('/profile');
      }
    } catch (error) {
      console.error(error);
      req.session.msg = 'Something went wrong, please try again';
      return res.redirect('/profile');
    }
  });
});

router.post("/logout", (req, res) => {
  req.session.isAuth = false;
  req.session.destroy((error) => {
    if (error) {
      //console.log(error)
    } else {
      res.redirect("/")
    }
  });
});


router.post('/resetpass', async (req, res) => {
  const { pass, cpass } = req.body;
  if (pass.length < 8) {
    req.session.msg = "Password must be at-least 8 character long"
    req.session.reset = true;
    res.redirect('/resetpassword')
  }
  else {
    if (pass != cpass) {
      req.session.msg = `Password doesn't match each other`
      req.session.reset = true;
      res.redirect('/resetpassword')
    }
    else {
      let hashpass = await bcrypt.hash(pass, 8);
      USER.updateOne({ password: req.session.id }, { $set: { password: hashpass } }, (err, ans) => {
        if (err) {
          //console.log(err)
          req.session.msg = 'Error occure during change try again'
          req.session.reset = true;
          res.redirect('/resetpassword')
        } else {
          delete req.session.msg;
          delete req.session.reset;
          res.redirect('/login')
        }
      })
    }
  }
})



module.exports = router;
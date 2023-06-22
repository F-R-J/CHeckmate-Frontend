require("dotenv").config();
const express = require("express");
const authcontroller = require("../controllers/auth");
const db=require('../db/database');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const e = require("express");

const router = express.Router();

router.post("/signup", authcontroller.signup);
router.post("/verify", authcontroller.verify);
router.post("/login", authcontroller.login);
router.post("/homepage", authcontroller.homepage);
router.post("/chessgame", authcontroller.chessgame);


router.post('/verify_email',(req,res)=>{
  //console.log('aise');
  const email = req.body.email;
  db.query('SELECT * from login WHERE email=?',[email],(err,result)=>{
    if(err){
      //console.log(err);
      res.redirect('/forgotpassword')
    }else{
      if(result.length > 0){

        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
  
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASSWORD,
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
      else{
        res.redirect('/forgotpassword')
      }
    }
  })
})

router.post('/verify1',(req,res)=>{
  const otp = req.body.OTP;
  ////console.log(req.body)
  if(otp === req.session.OTP){
      delete req.session.msg
      req.session.reset = true;
      res.redirect('/resetpassword')
  }
  else{
    req.session.msg='Wrong otp!! try again';
    res.redirect('/verify1')
  }
})

router.post('/changepass',(req,res)=>{
  //console.log(req.body);
  db.query("SELECT password from login WHERE id=?",[req.session.Uid],(error,result)=>{
    if(error){
      //console.log(error)
      res.redirect('/profile')
    }else{
      bcrypt.compare(req.body.opass, result[0].password).then(async (doMatch) => {
        if (doMatch) {
            if(req.body.npass != req.body.ncpass){
                req.session.msg="new password doesn't matched try again"
                res.redirect('/profile')
            }else{
                if(req.body.npass.length < 8){
                  req.session.msg='New password must be 8 character long'
                  res.redirect('/profile')
                }
                else{
                  delete req.session.msg;
                  let hashedpass = await bcrypt.hash(req.body.npass, 8);
                  //console.log(hashedpass);
                  db.query('UPDATE login set password=? Where id=?',[hashedpass,req.session.Uid],(err1,answer)=>{
                    if(err1){
                        //console.log(err1);
                        req.session.msg = "Something went wrong try again";
                        res.redirect('/profile')
                    }
                    else{
                      res.redirect('/profile')
                    }
                  })
                }
            }
        } else {
            req.session.msg='Old password do not matched try again'
            res.redirect('/profile')
        }
      });
    }
  })
})

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


router.post('/resetpass',async (req,res)=>{
  const {pass,cpass} = req.body;
  if(pass.length<8){
    req.session.msg = "Password must be at-least 8 character long"
    req.session.reset = true;
    res.redirect('/resetpassword')
  }
  else{
    if(pass!=cpass){
      req.session.msg = `Password doesn't match each other`
      req.session.reset = true;
      res.redirect('/resetpassword')
    }
    else{
      let hashpass = await bcrypt.hash(pass,8);
      db.query('UPDATE login SET password=? WHERE email=?',[hashpass,req.session.email],(err,ans)=>{
        if(err){
          //console.log(err)
          req.session.msg='Error occure during change try again'
          req.session.reset = true;
          res.redirect('/resetpassword')
        }else{
          delete req.session.msg;
          delete req.session.reset;
          res.redirect('/login')
        }
      })
    }
  }
})



module.exports = router;
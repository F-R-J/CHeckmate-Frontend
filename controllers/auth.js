require("dotenv").config();
const db = require("../db/database");
const mongoose = require("mongoose");
const USER = require("../db/models/loginSchema");
const Pimg = require("../db/models/profileImgSchema");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const e = require("express");


//const jwt = require("jsonwebtoken");
//const express = require("express");
//const async = require("hbs/lib/async");
//const router = express.Router()


exports.signup = async (req, res) => {
  //console.log(req.body);
  var cnt1 = 0;
  var cnt2 = 0;
  const { name, email, id, password, passwordConfirm } = req.body;

  let user = await USER.findOne({ email: email });
  if (user) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "The email is already in use",
    });
  } else if (password !== passwordConfirm) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "Passwords do not match",
    });
  } else if (password.length < 8) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "Password must be 8 characters long",
    });
  } else {
    cnt1 = 1;
  }

  // db.query(
  //   "select email from login where email=?",  
  //   [email],
  //   async (error, results) => {
  //     if (error) {
  //       //console.log(error);
  //     }
  //     if (results.length > 0) {
  //       return res.render("signup", {
  //         layout: "/layouts/logLayout",
  //         message: "The email is already in use",
  //       });
  //     } else if (password !== passwordConfirm) {
  //       return res.render("signup", {
  //         layout: "/layouts/logLayout",
  //         message: "Passwords do not match",
  //       });
  //     } else if (password.length < 8) {
  //       return res.render("signup", {
  //         layout: "/layouts/logLayout",
  //         message: "Password must be 8 characters long",
  //       });
  //     } else {
  //       cnt1 = 1;
  //     }
  //   }
  // );

  let userID = await USER.findOne({ ID: id });
  if (userID) {
    return res.render("signup", {
      layout: "/layouts/logLayout",
      message: "The username is already taken",
    });
  } else if (cnt1 == 1) {
    let hashedPassword = await bcrypt.hash(password, 8);
    //console.log(hashedPassword);
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
      subject: "Verification code for Checkmate profile.",
      text: "Your OTP is : " + OTP,
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        //console.log(error);
      } else {
        //console.log("Email sent: " + info.response);
        const user = {
          name: name,
          id: id,
          email: email,
          OTP: OTP,
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


// db.query("select id from login where id=?", [id], async (error, results) => {
//   if (error) {
//     //console.log(error);
//   }
//   if (results.length > 0) {
//     return res.render("signup", {
//       layout: "/layouts/logLayout",
//       message: "The username is already taken",
//     });
//   } else if (cnt1 == 1) {
//     let hashedPassword = await bcrypt.hash(password, 8);
//     //console.log(hashedPassword);

//     var digits = "0123456789";
//     let OTP = "";
//     for (let i = 0; i < 6; i++) {
//       OTP += digits[Math.floor(Math.random() * 10)];
//     }

//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: checkmate.sdp@gmail.com,
//         pass: "chietjvndhjaugpn",
//       },
//     });

//     let mailOptions = {
//       from: "checkmate.sdp@gmail.com",
//       to: email,
//       subject: "Verification code for Checkmate profile.",
//       text: "Your OTP is : " + OTP,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         //console.log(error);
//       } else {
//         //console.log("Email sent: " + info.response);
//         const user = {
//           name: name,
//           id: id,
//           email: email,
//           OTP: OTP,
//           pass: hashedPassword,
//         };

//         const data = JSON.stringify(user);

//         fs.writeFile("./user.json", data, (err) => {
//           if (err) {
//             //console.log(err);
//           } else {
//             //console.log("Data saved");
//           }
//         });

//         res.redirect('/verify')
//       }
//     });
//   }
// });

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
        delete req.session.msg
        res.redirect('/login')

        // db.query(
        //   "insert into login set ?",
        //   {
        //     name: user.name,
        //     id: user.id,
        //     email: user.email,
        //     password: user.pass,
        //   },
        //   (error, results) => {
        //     if (error) {
        //       //console.log(error);
        //     } else {
        //       db.query("insert into profileimg set ?", {
        //         uid: user.id,
        //         img: ''
        //       }, (err, reslt) => {
        //         if (err) {
        //           //console.log(err)
        //         }
        //         else {
        //           delete req.session.msg
        //           // console.log(results);
        //           res.redirect('/login')
        //         }
        //       })
        //     }
        //   }
        // );
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
    req.session.msg = "email or username doesn't exist";
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
    console.log(user);


    bcrypt.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        req.session.Uid = user.ID;
        //console.log("login Successful");
        if (remember == "yes") {
          req.session.isAuth = true;
          //console.log(req.session.isAuth);
        } else {
          req.session.isAuth = false;
          //console.log(req.session.isAuth);
        }
        req.session.canSee = true;
        res.redirect('/homepage')
      }
      else {
        req.session.msg = "Invalid Password!";
        return res.redirect('/login')
      }
    })
  }
}


  // exports.login = (req, res) => {
  //   //console.log(req.body);

  //   const { email_username, password, remember } = req.body;

  //   if (remember == "yes") {
  //     //console.log("remembered");
  //   }

  //   db.query(
  //     "Select email,id from login where email=? or id=?",
  //     [email_username, email_username],
  //     async (error, results) => {
  //       if (error) {
  //         //console.log(error);
  //       }
  //       else {
  //         if (results.length > 0) {
  //           db.query(
  //             "Select password,id from login where email=? or id=?",
  //             [email_username, email_username],
  //             async (error, results) => {
  //               if (error) {
  //                 //console.log(error);
  //               }
  //               if (results.length > 0) {
  //                 //console.log(results[0].password);
  //                 bcrypt.compare(password, results[0].password).then((doMatch) => {
  //                   if (doMatch) {
  //                     req.session.Uid = results[0].id;
  //                     //console.log("login Successful");
  //                     if (remember == "yes") {
  //                       req.session.isAuth = true;
  //                       //console.log(req.session.isAuth);
  //                     } else {
  //                       req.session.isAuth = false;
  //                       //console.log(req.session.isAuth);
  //                     }
  //                     if (doMatch) {
  //                       req.session.canSee = true;
  //                       res.redirect('/homepage')
  //                     }
  //                   } else {
  //                     req.session.msg = "Invalid Password!";
  //                     return res.redirect('/login')
  //                   }
  //                 });
  //               }
  //             }
  //           );
  //         }
  //         else {
  //           req.session.msg = "email or username doesn't exist";
  //           return res.redirect('/login')
  //         }
  //       }
  //     }
  //   );
  // };

  exports.homepage = (req, res) => {
    //console.log(req.body);

    //const { email_username, password } = req.body;
  };

  exports.chessgame = (req, res) => {
    //console.log(req.body);
  };

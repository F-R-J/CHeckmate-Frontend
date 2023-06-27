const express = require("express");
const session = require("express-session");
const db = require('../db/database')
const USER = require("../db/models/loginSchema");
const Pimg = require("../db/models/profileImgSchema");

const router = express.Router();

// Express middleware to prevent unauthorize navigations
const isAuth = (req, res, next) => {
  //console.log(req.session);
  if (req.session.isAuth === true) {
    res.redirect("/homepage");
  } else {
    next();
  }
};

router.get("/", isAuth, (req, res) => {
  //req.session.destroy()
  res.render("index", {
    layout: "layouts/indexLayout",
    title: "Checkmate",
    icon: "/image/checkmate.jpg",
  });
});

router.get("/signup", (req, res) => {
  res.render("signup", {
    layout: "layouts/logLayout",
    title: "Checkmate",
  });
});

router.get("/login", (req, res) => {
  if (req.session.msg) {
    res.render("login", {
      layout: "layouts/logLayout",
      title: "Checkmate",
      message: req.session.msg
    });
  } else {
    res.render("login", {
      layout: "layouts/logLayout",
      title: "Checkmate",
    });
  }
});

router.get("/verify", (req, res) => {
  if (req.session.msg) {
    res.render("verify", {
      layout: "layouts/logLayout",
      message: req.session.msg
    });
  } else {
    res.render("verify", {
      layout: "layouts/logLayout",
    });
  }
});

router.get("/verify1", (req, res) => {
  if (req.session.msg) {
    res.render("verify1", {
      layout: "layouts/logLayout",
      message: req.session.msg
    });
  } else {
    res.render("verify1", {
      layout: "layouts/logLayout",
    });
  }
});

const canSee = (req, res, next) => {
  if (req.session.canSee == true) {
    next()
  } else {
    res.redirect('/')
  }
}

// router.get("/homepage", canSee, (req, res) => {
//   //console.log(req.session)
//   db.query('Select * from profileimg where uid=?', [req.session.Uid], (err, result) => {
//     if (err) {
//       //console.log(err)
//     } else {
//       delete req.session.msg;
//       res.render("homepage", {
//         layout: "layouts/homeLayout",
//         id: req.session.Uid,
//         rows: result
//       });
//     }
//   })
// });

router.get("/homepage", canSee, async (req, res) => {
  // console.log(req.session)
  let PIMG = await Pimg.find({ uid: req.session.uid });
  // console.log(PIMG);
  if (PIMG) {
    delete req.session.msg;
    res.render("homepage", {
      layout: "layouts/homeLayout",
      id: req.session.uid,
      rows: PIMG
    });
  } else {
    console.log("Profile not found");
  }
});


var info = {
  Fname: '',
  uname: '',
  Email: ''
}


// const setVal = (req, res, next) => {
//   const id = req.session.Uid;
//   db.query('Select id,name,email from login where id=?', [id], async (error, result) => {
//     if (error) {
//       //console.log(error)
//       res.redirect('/')
//     } else {
//       if (result.length > 0) {
//         //console.log(result[0].name)
//         info.Email = result[0].email;
//         info.Fname = result[0].name;
//         info.uname = result[0].id;
//         //console.log(info.Fname)
//         next()
//       } else {
//         next()
//       }
//     }
//   })
// }


const setVal = (req, res, next) => {
  const id = req.session.uid;
  // console.log(id)
  USER.findOne({ ID: id }, (error, result) => {
    if (error) {
      // console.log(error);
      res.redirect('/');
    } else {
      if (result) {
        //console.log(result.uid);
        info.Email = result.email;
        info.Fname = result.name;
        info.uname = result.ID;
        next();
      } else {
        next();
      }
    }
  });
};


// router.get("/profile", canSee, setVal, (req, res) => {
//   if (info.Fname != '') {
//     const Fname = info.Fname;
//     db.query('Select * from profileimg where uid=?', [req.session.Uid], (err, result) => {
//       if (err) {
//         //console.log(err)
//       } else {
//         if (req.session.msg) {
//           res.render("profile", {
//             layout: "layouts/profileLayout",
//             Email: info.Email,
//             Uname: info.uname,
//             Fname: Fname,
//             rows: result,
//             msg: req.session.msg
//           });
//         } else {
//           res.render("profile", {
//             layout: "layouts/profileLayout",
//             Email: info.Email,
//             Uname: info.uname,
//             Fname: Fname,
//             rows: result
//           });
//         }
//       }
//     })
//   }
// });


router.get("/profile", canSee, setVal, async (req, res) => {
  if (info.Fname != '') {
    const Fname = info.Fname;
    Pimg.find({ uid: req.session.uid }, function (err, row) {
      if (err) {
        console.log(err);
      }
      else {
        // console.log(row);
        if (req.session.uid) {
          res.render("profile", {
            layout: "layouts/profileLayout",
            Email: info.Email,
            Uname: info.uname,
            Fname: Fname,
            rows: row,
            msg: req.session.msg
          });
        } else {
          res.render("profile", {
            layout: "layouts/profileLayout",
            Email: info.Email,
            Uname: info.uname,
            Fname: Fname,
            rows: row
          });
        }
      }
    });

    // if (err) {
    //   // console.log(err)
    // } else {
    //   if (req.session.msg) {
    //     res.render("profile", {
    //       layout: "layouts/profileLayout",
    //       Email: info.Email,
    //       Uname: info.uname,
    //       Fname: Fname,
    //       rows: result,
    //       msg: req.session.msg
    //     });
    //   } else {
    //     res.render("profile", {
    //       layout: "layouts/profileLayout",
    //       Email: info.Email,
    //       Uname: info.uname,
    //       Fname: Fname,
    //       rows: result
    //     });
    //   }
    // }
    // });
  }
});

router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword", {
    layout: "layouts/logLayout",
  });
});

const isallow = (req, res, next) => {
  if (req.session.reset === true) {
    next()
  }
  else {
    res.redirect('/forgotpassword')
  }
}

router.get("/resetpassword", isallow, (req, res) => {
  if (req.session.msg) {
    delete req.session.reset
    res.render("resetpassword", {
      layout: "layouts/logLayout",
      message: req.session.msg
    });
  } else {
    delete req.session.reset
    res.render("resetpassword", {
      layout: "layouts/logLayout",
    });
  }
});

router.get("/terms&policy", (req, res) => {
  res.render("terms&policy", {
    layout: "layouts/logLayout",
  });
});

router.get("/brickbreak", (req, res) => {
  res.render("brickbreak", {
    layout: "layouts/brickbreak",
  });
});


router.post('/profile_img', (req, res) => {
  // console.log(req.body)
  let samfile;
  let uploadpath;
  if (!req.files || Object.keys(req.files).length === 0) {
    //return res.status(400).send('No files were uploaded');
    if (req.body.fname != "") {
      const { fname } = req.body;
      let iid = req.session.uid;
      USER.update({ ID: iid }, { $set: { name: fname } }, (err1, ans) => {
        if (err1) {
          console.log(err1);
        } else {
          res.redirect('/profile')
        }
      });
    } else {
      res.redirect('/profile')
    }
  } else {
    samfile = req.files.profile_image;
    //console.log(samfile);
    let id = req.session.uid;
    let filename = id + 'profile.jpg';
    uploadpath = __dirname + '/../uploads/' + filename;
    samfile.mv(uploadpath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      Pimg.update({ uid: id }, { $set: { img: filename } }, (error, result) => {
        if (!error) {
          if (req.body.fname != "") {
            const { fname } = req.body;
            let iid = req.session.uid;
            USER.updateOne({ id: iid }, { $set: { name: fname } }, (err1, ans) => {
              if (err1) {
                //console.log(err1)
              } else {
                res.redirect('/profile')
              }
            })
          } else {
            res.redirect('/profile')
          }
        } else {
          //console.log(error);
        }
      })
    })
  }
})

module.exports = router;
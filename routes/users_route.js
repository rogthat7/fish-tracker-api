const express = require("express");
userRouter = express.Router();
bodyParser = require("body-parser");
const User = require("../models/user");
const UnverifiedUser = require("../models/unverified_user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
require("dotenv").config();
const clientTwilio = require("twilio")(
  process.env.MOBILEOTPACCOUNTID,
  process.env.MOBILEOTPAUTHTOKEN
);
const { Authorized } = require("../middlewares/authorize");
const { Admin } = require("../middlewares/admin_check");
const { isLoggedin } = require("../middlewares/login_check");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var otpGenerator = require('otp-generator');

const SALT_ROUNDS = 12;

//Verify Sent OTP
userRouter.post("/users/verifywithotp", Authorized, async (req, res) => {
  const otp = req.body.otp;
  try {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRETE, function (err, payload) {
      if (payload.isVarified == true) res.send("User Already Verified");
      else {
        User.findOne({ email: payload.email }, (err, user) => {
          clientTwilio.verify
            .services(process.env.MOBILEOTPSERVICEID)
            .verificationChecks.create({
              to: `+${payload.phoneNumber}`,
              code: otp,
            })
            .then((data) => {
              if (data.valid) {
                user.isVarified = true;
                user.save().then(() => res.status(200).send(data));
              } else res.status(400).send(data);
            })
            .catch((err) => {
              res.send("Error: " + err);
            });
        });
      }
    });
  } catch {
    res.send("Error: " + err);
  }
});

//Updated Admin privilages
userRouter.patch(
  "/users/updateadmin/:id",
  isLoggedin,
  Authorized,
  Admin,
  async (req, res) => {
    try {
      const userUpdated = await User.findByIdAndUpdate(
        req.params.id,
        {
          isAdmin: req.body.isAdmin,
        },
        {
          new: true,
        }
      );
      if (!userUpdated) res.status(404).send("user not found!");
      res.json(userUpdated);
    } catch (error) {
      res.send("Error: " + error);
    }
  }
);


// Post: Create New User with email varification
userRouter.post("/users/registerwithemail", async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
      });
      if (req.body.email == null) res.status(400).send();
      else {
        // generate otp for the user 
        const otp = otpGenerator.generate(6, { upperCase: true, specialChars: false });
        // encrypt the otp before it is confirmed
        bcrypt.hash(otp, SALT_ROUNDS, async (err, otphash) => {
          let unverifiedUser = new UnverifiedUser({
            email : req.body.email,
            emailToken : otphash
          });
          unverifiedUser.save().then(() => {
            user.save().then(() => {
              // send the email
              const msg = {
                to: user.email, // Change to your recipient
                from: "fish-tracker-app@outlook.com", // Change to your verified sender
                subject: "Verification for Fish-Tracker-App",
                text: "Your OTP via email Verification code is",
                html: "Your OTP via email Verification code is <strong><h2>"+otp+"</h2></strong>",
              };
              sgMail
                .send(msg)
                .then(() => {
                  res.status(200).json({message:msg});
                })
                .catch((error) => {
                  console.error(error);
                  res.status(500).json({error:error});
                });
          }).catch((err)=>{
            res.status(500).send(err);
          });
        }).catch((err)=>{
          res.status(500).send(err);
        });
       });
      }
    });
  } catch (err) {
    res.status(500).json({error:err});
  }
});

// Post: Create New User with otp varification
userRouter.post("/users/registerwithotp", async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
      });
      if (req.body.email == null) res.status(400).send();
      else {
        clientTwilio
          .verify
          .services(process.env.MOBILEOTPSERVICEID)
          .verifications
          .create({
            to: `+${req.body.phoneNumber}`,
            channel: "sms"
          })
          .then((data) => {
              user.save().then(() => {
              res.status(201).send(data);
            }).catch((error) => {
              res.status(500).send(error._message);
            });
          });
      }
    });
  } catch (err) {
    res.status(500).json({error:err});
  }
});

// Get Unverified Users
userRouter.get("/users/getunverifiedusers", isLoggedin, Authorized, async (req, res) => {
  try {
    const unverifiedUsers = await UnverifiedUser.find();
    res.json(unverifiedUsers);
  } catch (error) {
    res.send("Error: " + error);
  }
});

// Get
userRouter.get("/users/getusers", isLoggedin, Authorized, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.send("Error: " + error);
  }
});

// Get by Id
userRouter.get("/users/:id", Authorized, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.send("Error: " + error);
  }
});

//Updated User Request
userRouter.patch(
  "/users/update/:id",
  isLoggedin,
  Authorized,
  async (req, res) => {
    try {
      const userUpdated = await User.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hash(req.body.password, SALT_ROUNDS).hash,
        },
        {
          new: true,
        }
      );
      if (!userUpdated)
        res.status(404).send.json({
          error: "User not found",
        });
      res.json(userUpdated);
    } catch (error) {
      res.send({ Error: error });
    }
  }
);

//Delete by Id
userRouter.delete(
  "/users/delete/:id",
  isLoggedin,
  Authorized,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      const a1 = await user.delete(user);
      res.json("User with the Id:" + req.params.id + " Deleted.");
    } catch (error) {
      res.send("ErrorDelete: " + error);
    }
  }
);
// should be a hidden endpoint
// Post: Create New User
userRouter.post("/users/createuser", async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
        isVarified: true,
        isAdmin: true,
      });

      const a1 = await user
        .save()
        .then((a1) => {
          res.status(201).send(a1);
        })
        .catch((error) => {
          res.status(500).send(error.message);
        });
    });
  } catch (err) {
    res.send(json(err));
  }
});

module.exports = userRouter;

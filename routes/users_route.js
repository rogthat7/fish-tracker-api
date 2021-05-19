const express = require('express');
userRouter = express.Router();
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
require('dotenv').config();
const clientTwilio = require('twilio')(process.env.MOBILEOTPACCOUNTID, process.env.MOBILEOTPAUTHTOKEN);
const { Authorized } = require('../middlewares/authorize');  
const { Admin } = require('../middlewares/admin_check');  
const { isLoggedin } = require('../middlewares/login_check');  
const SALT_ROUNDS = 12;


//Verify Sent OTP
userRouter.post('/users/verifywithotp', Authorized, async (req, res) => {
  const otp = req.body.otp;
  try { 
      let token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.SECRETE, function (err, payload) {
        if(payload.isConfirmed == true)
            res.send("User Already Verified");
        else{
          User.findOne({ email :  payload.email},(err,user)=>{
            clientTwilio
            .verify
            .services(process.env.MOBILEOTPSERVICEID)
            .verificationChecks
            .create({
              to: `+${payload.phoneNumber}`,
              code: otp
            }).then((data)=>{
                if (data.valid) {
                  user.isConfirmed = true;
                  user.save().then(() => 
                  res.status(200).send(data))
                }
              else 
                res.status(400).send(data);
            }).catch((err)=>{
              res.send('Error: ' + err);
            });
          });
          
        }
      });
    
  }
  catch{
    res.send('Error: ' + err);
  }
});

//Updated Admin privilages
userRouter.patch('/users/updateadmin/:id', isLoggedin, Authorized, Admin, async (req, res) => {
  try {
      const userUpdated = await User.findByIdAndUpdate(req.params.id,
          {
              isAdmin: req.body.isAdmin
          },
          {
              new: true
          }
      );
      if (!userUpdated)
          res.status(404).send("user not found!");
      res.json(userUpdated);
  } catch (error) {
      res.send('Error: ' + error);
  }
});

// Post: Create New User with otp varification
userRouter.post('/users/registerwithotp', async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash
      });
      if(req.body.email==null)
        res.status(400).send();
      else{
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
  }
  catch (err) {
    res.send(json(err));
  }
});
// Get
userRouter.get('/users/getusers', isLoggedin, Authorized, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.send('Error: ' + error);
  }
});

// Get by Id 
userRouter.get('/users/:id', Authorized, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.send('Error: ' + error);
  }
});



//Updated User Request
userRouter.patch('/users/update/:id', isLoggedin, Authorized, async (req, res) => {
  try {
    const userUpdated = await User.findByIdAndUpdate(req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hash(req.body.password, SALT_ROUNDS).hash
      },
      {
        new: true
      }
    );
    if (!userUpdated)
      res.status(404).send.json({
        error : "User not found"
      });
    res.json(userUpdated);
  } catch (error) {
    res.send({Error:  error});
  }
});

//Delete by Id
userRouter.delete('/users/delete/:id', isLoggedin, Authorized,  async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const a1 = await user.delete(user);
    res.json("User with the Id:" + req.params.id + " Deleted.");
  } catch (error) {
    res.send('ErrorDelete: ' + error);
  }
});
// should be a hidden endpoint
// Post: Create New User
userRouter.post('/users/createuser',  async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
        isConfirmed:true,
        isAdmin:true,
      });

      const a1 = await user.save().then((a1) => {
          res.status(201).send(a1);
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    });
  }
  catch (err) {
    res.send(json(err));
  }
});


module.exports = userRouter;

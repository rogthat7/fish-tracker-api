const express = require('express');
router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
require('dotenv').config();
const clientTwilio = require('twilio')(process.env.MOBILEOTPACCOUNTID, process.env.MOBILEOTPAUTHTOKEN);
const { Authorized } = require('../middlewares/authorize');  
const { Admin } = require('../middlewares/admin_check');  
const SALT_ROUNDS = 12;
const options = {
  expiresIn: '24h',
  issuer: 'roger'
}

//Verify Sent OTP
router.post('/users/verifywithotp', Authorized, async (req, res) => {
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
              res.send('ErrorTwilio: ' + err);
            });
          });
          
        }
      });
    
  }
  catch{
    res.send('ErrorVerify: ' + err);
  }
});

//Updated Admin privilages
router.patch('/users/updateadmin/:id', Authorized, Admin, async (req, res) => {
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
      res.send('ErrorPatch: ' + error);
  }
});

// Post: Create New User with otp varification
router.post('/users/registerwithotp', async (req, res) => {
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
router.get('/users/getusers', Authorized, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.send('Error: ' + error);
  }
});

// Get by Id 
router.get('/users/:id', Authorized, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.send('Error: ' + error);
  }
});

// Get Token 
router.post('/users/login', async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).then(
      (user) => {
        if (!user) {
          return res.status(404).json({
            error: new Error('User not found!')
          });
        }
        bcrypt.compare(req.body.password, user.password).then(
          (valid) => {
            if (!valid) {
              return res.status(401).json({
                error: new Error('Incorrect password!')
              });
            }
            //craete jwt token
            let jwttoken = jwt.sign({ name: user.name, email: user.email, isAdmin: user.isAdmin, isConfirmed:user.isConfirmed, phoneNumber: user.phoneNumber }, process.env.SECRETE, options);
            res.status(200).json({
              _token: "bearer " + jwttoken
            });
          }
        ).catch(
          (error) => {
            res.status(500).json({
              error: error
            });
          }
        );
      }
    ).catch(
      (error) => {
        res.status(500).json({
          error: error
        });
      }
    );
  } catch (error) {
    res.status(404).send();
  }
});


//Updated User Request
router.patch('/users/update/:id', Authorized, async (req, res) => {
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
      res.status(404).send("user not found!");
    res.json(userUpdated);
  } catch (error) {
    res.send('ErrorPatch: ' + error);
  }
});

//Delete by Id
router.delete('/users/delete/:id', Authorized, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const a1 = await user.delete(user);
    res.json("User with the Id:" + req.params.id + " Deleted.");
  } catch (error) {
    res.send('ErrorDelete: ' + error);
  }
});

// Post: Create New User
router.post('/users/createuser', async (req, res) => {
  try {
    //encrypt the password
    bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hash,
        isConfirmed:true
      });

      const a1 = await user.save().then(() => {
        res.status(201).send(a1);
      }).catch((error) => {
        res.status(500).send(error._message);
      });
    });
  }
  catch (err) {
    res.send(json(err));
  }
});


module.exports = router;

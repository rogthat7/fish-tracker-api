const express = require('express');
router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Authorized } = require('../middlewares/authorize');
const SALT_ROUNDS = 12;
const options = {
  expiresIn:'24h',
  issuer: 'roger'
}
// Get
router.get('/getusers',  Authorized,  async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.send('Error: ' + error);
    }
});
// Get by Id 
router.get('/:id', Authorized, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.send('Error: ' + error);
    }
});

// Get Token 
router.post('/gettoken', async (req, res) => {
    try {
            User.findOne({ email: req.body.email }).then(
              (user) => {
                if (!user) {
                  return res.status(401).json({
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
                    let jwttoken = jwt.sign({ name: user.name, email: user.email, isAdmin: user.isAdmin }, process.env.SECRETE, options);
                    res.status(200).json({
                      _token: "bearer "+ jwttoken
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
        }catch(error){
            res.status(404).send();
        }
});

//Patch Request
router.patch('/update/:id', Authorized, async (req, res) => {
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
router.delete('/delete/:id', Authorized,  async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        const a1 = await user.delete(user);
        res.json("User with the Id:" + req.params.id + " Deleted.");
    } catch (error) {
        res.send('ErrorDelete: ' + error);
    }
});

// Post: Create New User
router.post('/createuser', async (req, res) => {
    try {
        //encrypt the password
        bcrypt.hash(req.body.password, SALT_ROUNDS, async (err, hash) => {
            let user = new User({
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                isAdmin: req.body.isAdmin,
                password: hash
            });

            const a1 = await user.save().then(()=>{
              //craete jwt token
              let jwttoken = jwt.sign({ name: req.body.name, email: req.body.email, isAdmin: req.body.isAdmin }, process.env.SECRETE,options);
              res.status(201).send(jwttoken);
            }).catch((error)=>{
              res.status(500).send(error._message);
            });
        });
}
  catch(err){
    res.send(json(err));
  }
});


module.exports = router;

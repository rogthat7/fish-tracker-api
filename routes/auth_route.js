const express = require("express");
authRouter = express.Router();
const User = require("../models/user");
const Login = require("../models/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isLoggedin } = require('../middlewares/login_check');  
const { Admin } = require('../middlewares/admin_check');  

const ATOptions = {
  expiresIn: "15m",
  issuer: "fish-tracker-app",
};
const RTOptions = {
  issuer: "fish-tracker-app",
};
// Get Token
authRouter.post("/auth/refreshtoken", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    if (refreshToken == null) return res.sendStatus(401);
    Login.findOne({ refresh_token: refreshToken }).then((login) => {
      if (!login) return res.sendStatus(403);
      jwt.verify(
        login.refresh_token,
        process.env.REFRESH_TOKEN_SECRETE,
        (err, refreshedLogin) => {
          if (err) return res.sendStatus(403);
          const refreshedUser = {
            id: refreshedLogin.id,
            name: refreshedLogin.name,
            email: refreshedLogin.email,
            password : refreshedLogin.password,
            isAdmin: refreshedLogin.isAdmin,
            isConfirmed: refreshedLogin.isConfirmed,
            phoneNumber: refreshedLogin.phoneNumber,
          }
          //craete jwt token
          const jwttoken = GenerateAccessTokenForUser(refreshedUser);
          res.status(200).json({
            "access_token": jwttoken,
          });
        }
      );
    });
  } catch (error) {
    res.sendStatus(404);
  }
});

// Get Token
authRouter.post("/auth/login", async (req, res) => {
  try {
    await User.findOne({ email: req.body.email },(err, validUser)=>{
      if (!validUser) {
        return res.sendStatus(404);
      }
      bcrypt.compare(req.body.password, validUser.password).then((valid) => {
        if (!valid) {
          return res.status(401).json({
            error: "Incorrect password!",
          });
        }
        //if user already is logged in, just return the refresh token
        Login.findOne({user_id:validUser.id},(err,loginInfo)=>{
          if(loginInfo)
            return res.status(201).json({"loginInfo" : loginInfo});
          else{
            let user = {
              id: validUser.id,
              name: validUser.name,
              email: validUser.email,
              password : validUser.password,
              isAdmin: validUser.isAdmin,
              isConfirmed: validUser.isConfirmed,
              phoneNumber: validUser.phoneNumber,
            }
      
            const accessToken = GenerateAccessTokenForUser(user);
            jwt.sign(
              user,
              process.env.REFRESH_TOKEN_SECRETE,
              RTOptions,
              (err, refreshToken) => {
                if (err) return res.sendStatus(500);
                const login = new Login({
                  user_id : user.id,
                  refresh_token : refreshToken,
                  login_time : Date.now().toString()
                });
                login.save()
                  .then((login) => {
                    console.log(login);
                    res.status(201).json({"access_token" : accessToken,"login_info" : login});
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.sendStatus(500);
                  });
              }
            );
          }
        });
      });
      });
      
     
      

  } catch (error) {
    res.sendStatus(404);
  }
});

// Get Token
authRouter.post("/auth/logout/:login_id", isLoggedin, async (req, res) => {
  try {
    const login = await Login.findById(req.params.login_id);

    const a1 = await login.delete();
    res.json("User with the Login Id:" + req.params.login_id + " Logged Out.");
  } catch (error) {
    res.status(404).send(error);
  }
});
userRouter.get('/auth/getlogins', isLoggedin, Admin, async (req, res) => {
  try {
    const logins = await Login.find();
    res.json(logins);
  } catch (error) {
    res.send('Error: ' + error);
  }
});
function  GenerateAccessTokenForUser(user) {
  //craete jwt token
  const accessToken = "Bearer " + jwt.sign(
    user,
    process.env.ACCESS_TOKEN_SECRETE,
    ATOptions
  );
  return accessToken;
}

module.exports = authRouter;

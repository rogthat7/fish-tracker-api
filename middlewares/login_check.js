const jwt = require('jsonwebtoken');
const Login = require("../models/auth");
exports.isLoggedin = function (req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).send("Header Missing");
    }
    let token = req.headers.authorization.split(' ')[1];
    if (!token) res.status(401).send("No Token found");
    // need to get the user's is present in the login table
    // verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (err, payload) {
        if (err)  res.sendStatus(403);

        //check for the login
        Login.findOne({ user_id: payload.id },(err, value)=>{
            if (!value) res.status(404).send("user not logged in");
            else
            next();
        });
        
    });
};

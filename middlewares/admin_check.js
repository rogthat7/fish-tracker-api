
const jwt = require('jsonwebtoken');

exports.Admin = function (req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).send("Header Missing");
    }
    let token = req.headers.authorization.split(' ')[1];
    if (!token) res.status(401).send("No Token found");


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (err, payload) {
        if (!payload.isAdmin) {
            res.status(401).send("User Not Authorised");
        }
        
        next();
    });
};

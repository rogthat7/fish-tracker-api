const jwt = require('jsonwebtoken');

exports.Authorized = function (req, res, next) {
    let token = req.headers.authorization.split(' ')[1];
    if (!token) res.status(401).send("No Token found");


    jwt.verify(token, process.env.SECRETE, function (err, decoded) {
        if (err) {
            res.status(401).send("User Not Authorised");
        }
        next();
    });
};

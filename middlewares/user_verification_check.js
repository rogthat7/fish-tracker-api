const jwt = require('jsonwebtoken');
exports.isVerified = function (req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).send("Header Missing");
    }
    let token = req.headers.authorization.split(' ')[1];
    if (!token) res.status(401).send("No Token found");
    // need to get the user's is present in the login table
    // verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (err, payload) {
        if (err)  res.sendStatus(403);
        let token = req.headers.authorization.split(" ")[1];
        if (payload.isVerified == true) 
            next();
        else
            res.status(403).send("User not Verified!");
    });
};

const jwt = require ("jsonwebtoken");

const verifyUser = (req, res, next) => {
    const token = req?.cookies?.access_token;
    if (!token) {
        res.redirect("/")
    }
    else{
        jwt.verify(token, "asdfasdjlksdf", (err, user) => {
            if (err) {
                res.send("Error Occur");
            }
            //if valid token then send user through req
            req.user = user;
            next();
        })
    }
}

module.exports = verifyUser;
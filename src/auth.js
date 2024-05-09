const jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {

    try{
        let token = req.cookies?.Authorization;
    
        if (token) {
    
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {

                if(err || !decoded) res.redirect("/logout")

                req.userId    = decoded?.userId;
                req.userCity  = decoded?.userCity;
                req.userName  = decoded?.userName;
                req.userEmail = decoded?.userEmail;
            });
        }
        next()

    } catch(error){
        console.error("Error generating token:", error);
        throw new Error("Error generating token");
    }

}


function generateToken(token_obj) {

    try {

        return jwt.sign(token_obj,
                        process.env.SECRET_KEY,
                        { expiresIn: '1h' });

    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Error generating token");
    }
}

module.exports = {
    verifyToken,
    generateToken
}


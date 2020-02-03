const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const db = require('../util/database');;
const saltRounds = 12;

registerController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        const result = await db.execute('INSERT INTO users (first_name, last_name, email, profile_image, password, status, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.first_name, req.body.last_name, req.body.email, req.body.profile_image, hash, 1, 1]);
        
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
        const token = jwt.sign({
                email: user[0].email,
                userId: user[0].id
            }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.status(200).json({ msg: "User registered", token: token });
        //res.status(200).json({ msg: "User registered" });
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = registerController;
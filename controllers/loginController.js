const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendgrid = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

const saltRounds = 12;

const db = require('../util/database');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
        if (user.length === 0) {
            return res.status(401).json({ msg: 'User not found' });
        }
        const result = await bcrypt.compare(req.body.password, user[0].password);
        if (result === true) {
            const token = jwt.sign({
                email: user[0].email,
                userId: user[0].id
            }, process.env.JWT_SECRET, { expiresIn: '12h' });
            res.status(200).json({ msg: "logged in", token: token });
        }
        else {
            res.status(401).json({ msg: 'Invalid password' });
        }
    }
    catch (error) {
        next(new Error(error));
    }
}

const resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
        if (user.length === 0) {
            return res.status(401).json({ msg: 'User not found' });
        }
    }
    catch (err) {
        next(new Error(err));
    }
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            next(new Error(err));
        }
        const token = buffer.toString('hex');
        try {
            await db.execute('INSERT INTO reset_tokens (email, token) values (?, ?)', [req.body.email, token]);
            await sendgrid.send({
              to: req.body.email,
              from: "donotreply@kyte.com",
              subject: "Reset password link",
              html: `
                    <h1>Kyte</h1>
                    <p>You requested a password reset</p>
                    <p>Click this link: <a href="https://api.gitanjaliapi.com/reset/${token}">Reset password</a> </p>
                `
            });
            res.status(200).json({ msg: 'reset link sent' });
        }
        catch (error) {
            next(new Error(error));
        }
    });
}

const checkToken = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [user] = await db.execute('SELECT users.id, first_name, last_name, profile_image, reset_tokens.createdAt FROM users JOIN reset_tokens ON (users.email = reset_tokens.email) WHERE token = ?', [req.body.token]);
        if (user.length === 0) {
            return res.status(422).json({ success: -1, msg: 'invalid token' });
        }
        const d1 = new Date(user[0].createdAt);
        const d2 = new Date();
        const diff = Math.abs(d1.getTime() - d2.getTime()) / 3600000;
        if (diff < 1) {
            return res.status(200).json({ user: user[0], success: 1, msg: 'done' });
        }
        else {
            await db.execute('DELETE FROM reset_tokens WHERE token = ?', [req.body.token]);
            res.status(422).json({ success: 0, msg: 'token expired' });
        }
    }
    catch (error) {
        next(new Error(error));
    }
}

const changePassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
       /* const [token] = await db.execute('SELECT email, createdAt FROM reset_tokens WHERE token = ?', [req.body.token]);
        if (token.length === 0) {
            return res.status(422).json({ success: -1, msg: 'invalid token' });
        }
        const d1 = new Date(token[0].createdAt);
        const d2 = new Date();
        const diff = Math.abs(d1.getTime() - d2.getTime()) / 3600000;
        if (diff < 1) {
            const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [token[0].email]);
            if (user[0].id !== req.body.id) {
                return res.status(401).json({ msg: 'unauthorized password change attempt' });
            }*/
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            await db.execute('UPDATE users SET password = ? WHERE id = ?', [hash, req.body.id]);
            //await db.execute('DELETE FROM reset_tokens WHERE token = ?', [req.body.token]);
            return res.status(200).json({ msg: 'password changed' });
        /*}
        else {
            await db.execute('DELETE FROM reset_tokens WHERE token = ?', [req.body.token]);
            res.status(422).json({ success: 0, msg: 'token expired' });
        }*/
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = {
    login,
    resetPassword,
    checkToken,
    changePassword
};
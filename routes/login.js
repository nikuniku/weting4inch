const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const loginController = require('../controllers/loginController');
const isAuth = require('../middlewares/isAuthenticated');

router.post('/', [
    body('email', 'Email is required').exists().isEmail().withMessage('Invalid email'),
    body('password', 'Password is required').exists().isLength({ min: 5, max: 20}).withMessage('Invalid password')
], loginController.login);

router.post('/reset', [
    body('email', 'Email is required').exists().isEmail().withMessage('Invalid email'),
], loginController.resetPassword);

router.post('/check-token', [
    body('token', 'reset token is required').exists(),
], loginController.checkToken);

router.post('/change-password', [
    //body('token', 'reset token is required').exists(),
    body('id', 'user id is required').exists(),
    body('password', 'Password is required').exists().isLength({ min: 5, max: 20}).withMessage('Invalid password')
], loginController.changePassword);

router.post('/verify', isAuth, (req, res, next) => {
    res.status(200).json({ msg: "success" });
});

module.exports = router;
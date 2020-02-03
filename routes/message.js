const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const isAuth = require('../middlewares/isAuthenticated');
const messageController = require('../controllers/messageController');
const getRelation = require('../middlewares/getRelation');

router.post('/send', isAuth, [
    body('r_id', 'reciever id is required').exists(),
    body('msg', 'message is required').exists()
], getRelation, messageController.sendMessage);

router.post('/get', isAuth, [
    body('r_id', 'reciever id is required').exists(),
    //body('pag_no', 'pagination no is required').exists()
], messageController.getMessages);

module.exports = router;
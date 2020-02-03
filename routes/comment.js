const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const isAuth = require('../middlewares/isAuthenticated');
const commentController = require('../controllers/commentController');
const getPosterId = require('../middlewares/getPosterId');
const getRelation = require('../middlewares/getRelation');

router.post('/save', isAuth, [
    body('comment', 'comment cannot be empty').exists(),
    body('reply', 'reply field is required').exists(),
    body('postId', 'post id is required').exists()
], getPosterId, getRelation, commentController.saveComment);

router.post('/getall', isAuth, [
    body('postId', 'post id is required').exists()
], getPosterId, getRelation, commentController.getAllComments);

router.post('/delete', isAuth, [
    body('comId', 'comment id is required').exists()
], commentController.deleteComment);

module.exports = router;
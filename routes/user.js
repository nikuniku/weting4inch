const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const isAuth = require('../middlewares/isAuthenticated');
const userController = require('../controllers/userController');

router.post('/getuser', isAuth, [
    body('id', 'User id is required').exists()
], userController.getUser);


router.post('/updateuser', [
	body('id', 'User id is required').exists(),
  //body('password', 'Password is required').exists().isLength({ min: 5, max: 25}).withMessage('Password should have atleast 5 characters'),
  //body('first_name', 'Name is required').exists().isLength({ min: 5, max: 40}).escape().trim(),
  //body('last_name', 'Name is required').exists().isLength({ min: 5, max: 40}).escape().trim(),
  /*body('username', 'Username is required').exists()
  .isLength({ min: 5, max: 25}).withMessage('Username should have atleast 5 characters')
  .isAlphanumeric().withMessage('Username should be alpha-numeric').custom((value, { req }) => {
    return db.execute('SELECT 1 FROM users WHERE username = ?', [value])
      .then(([user]) => {
        if (user.length > 0) {
          return Promise.reject('Username already in use');
        }
        if (value === 'home' || value === 'notifications' || value === 'friends' || value === 'discover' || value === 'requests' || value === 'message' || value === 'post' || value === 'login' || value === 'register' || value === 'reset' ) {
          return Promise.reject(`Username ${value} is a reserved word`);
        }
      });
  }),*/
  //body('birthday', 'Birthday is required').exists().toDate(),
  //body('gender', 'Gender is required').exists().isIn(['male', 'female', 'others']).withMessage('Gender invalid')
], userController.updateUser);

router.post('/getallusers', isAuth, userController.getAllUsers);

router.post('/getfriends', isAuth, userController.getFriends);

router.post('/sendrequest', isAuth, [
    body('id', 'User id is required').exists()
], userController.sendRequest);

router.post('/getrequests', isAuth, userController.getRequests);

router.post('/acceptrequest', isAuth, [
    body('relId', 'Relation id is required').exists()
], userController.acceptRequest);

router.post('/rejectrequest', isAuth, [
    body('relId', 'Relation id is required').exists()
], userController.rejectRequest);

router.post('/getnotifications', isAuth, userController.getNotifications);

module.exports = router;
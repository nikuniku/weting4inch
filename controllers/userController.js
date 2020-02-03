const { validationResult } = require('express-validator/check');

const db = require('../util/database');
const io = require('../util/socket');

const getUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    if (req.body.id === -1) {
        req.body.id = req.userId;
    }
    try {
        const [user] = await db.execute('SELECT id, email, first_name, last_name, profile_image FROM users WHERE id = ?', [req.body.id]);
        res.status(200).json({ user: user[0] || [] });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT id, email, first_name, last_name, profile_image FROM users WHERE id <> ?', [req.userId]);
        for (let i=0; i<users.length; i++) {
            const resl = await db.execute('SELECT id FROM relationships WHERE ((user_one = ? AND user_two = ?) OR (user_one = ? AND user_two = ?)) AND status = 1', [req.userId, users[i].id, users[i].id, req.userId]);
            if (resl[0].length > 0) {
                users[i].friends = 1;
            }
        }
        res.status(200).json({ users: users });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getFriends = async (req, res, next) => {
    try {
        const [friends] = await db.execute('SELECT id, email, first_name, last_name, profile_image FROM users WHERE id IN (SELECT user_one FROM relationships WHERE user_two = ? AND status = 1 UNION SELECT user_two from relationships WHERE user_one = ? AND status = 1)', [req.userId, req.userId]);
        res.status(200).json({ friends: friends });
    }
    catch (error) {
        next(new Error(error));
    }
}

const sendRequest = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const sm = (req.userId > req.body.id) ? req.body.id : req.userId;
        const gt = (req.userId < req.body.id) ? req.body.id : req.userId;
        const [status] = await db.execute('SELECT status FROM relationships WHERE user_one = ? AND user_two = ?', [sm, gt]);
        if (status.length > 0) {
            return res.status(400).json({ msg: 'Request cannot be sent. Already Friend' });
        }
        const [result] = await db.execute('INSERT INTO relationships (user_one, user_two, status, action_user, r_date) values (?, ?, ?, ?, ?)', [
            sm, gt, 0, req.userId, new Date().toISOString().split('.')[0]
        ]);
        //io.getIO().to(req.body['id']).emit('getrequest', { relId: result[0].insertId, actionUser:req.userId, msg: "Request get"});
        res.status(200).json({ msg: 'Request sent' });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getRequests = async (req, res, next) => {
    try {
        const [result] = await db.execute('SELECT * FROM relationships WHERE ((user_one = ? OR user_two = ?) AND status = 0 AND action_user <> ?)', [req.userId, req.userId, req.userId]);
        let users =  [];
        for (let i = 0; i<result.length; i++) {
            const resl = await db.execute('SELECT * FROM users WHERE id = ?', [result[i].action_user]);
            resl[0][0].relId = result[i].id;
            users.push(resl[0][0]);
        }
        res.status(200).json({ requests: users });
    }
    catch (error) {
        next(new Error(error));
    }
}

const acceptRequest = async (req, res, next) => {
    try {
        const [result] = await db.execute('UPDATE relationships SET status = 1, action_user = ? WHERE id = ?', [req.userId, req.body.relId]);
        res.status(200).json({ msg: 'Accepted' });
    }
    catch (error) {
        next(new Error(error));
    }
}

const rejectRequest = async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM relationships WHERE id = ?', [req.body.relId]);
        res.status(200).json({ msg: 'Rejected' });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getNotifications = async (req, res, next) => {
    try {
        const [notis] = await db.execute('SELECT * FROM notifications WHERE u_id = ?', [req.userId]);
        res.status(200).json({ notifications: notis });
    }
    catch (error) {
        next(new Error(error));
    }
}

const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        //const hash = await bcrypt.hash(req.body.password, saltRounds);
        const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [req.body.id]);
        const first_name = req.body.first_name ? req.body.first_name : user[0].first_name;
        const last_name = req.body.last_name ? req.body.last_name : user[0].last_name;
        const profile_image = req.body.profile_image ? req.body.profile_image : user[0].profile_image;
       
        const result = await db.execute('UPDATE users SET first_name=?, last_name=?, profile_image=? WHERE id=?', [first_name, last_name, profile_image, req.body.id]);
        res.status(200).json({ msg: "User updated", status:true });
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = {
    getUser,
    getAllUsers,
    getFriends,
    sendRequest,
    getRequests,
    acceptRequest,
    rejectRequest,
    getNotifications,
    updateUser
};
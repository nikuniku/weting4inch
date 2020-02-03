const { validationResult } = require('express-validator/check');

const db = require('../util/database');
const io = require('../util/socket');

const sendMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    if (req.relation !== 1) {
        return res.status(422).json({ msg: 'cant send message to specified user; not friend' });
    }
    try {
        const result = await db.execute('INSERT INTO messages (msg, s_id, r_id, seen) VALUES (?, ?, ?, ?)', [req.body.msg, req.userId, req.body.r_id, 1]);
        const date = new Date().toISOString();
        io.getIO().to(req.body['r_id']).emit('message', { id: result[0].insertId, msg: req.body.msg, s_id: req.userId, r_id: req.body.r_id, seen: 1, dts: date, seen: 1 });
        res.status(200).json({ msg: 'message sent', dts: date, id: result[0].insertId });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getMessages = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const offset = 50 * +req.body.pag_no;
        const [messages] = await db.execute('SELECT id, msg, r_id, s_id, seen, createdAt AS dts FROM messages WHERE (( r_id = ? AND s_id = ? ) OR ( r_id = ? AND s_id = ? )) ORDER BY createdAt ASC', [
            req.userId,
            req.body.r_id,
            req.body.r_id,
            req.userId
        ]);
        res.status(200).json({ messages: messages });
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = {
    sendMessage,
    getMessages
};
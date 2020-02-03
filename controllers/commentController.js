const { validationResult } = require('express-validator/check');

const db = require('../util/database');

const saveComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        if (req.relation === -1 || req.relation === 1 || req.public) {
            const result = await db.execute('INSERT INTO comments (comment, reply, p_id, com_id) VALUES (?, ?, ?, ?)', [
                req.body.comment,
                req.body.reply,
                req.body.postId,
                req.userId
            ]);
            res.status(200).json({ msg: "comment saved", id: result[0].insertId });
        }
        else {
            res.status(401).json({ msg: "cannot comment, unauthorized" });
        }
    }
    catch (error) {
        next(new Error(error));
    }
}

const getAllComments = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        if (req.relation === -1 || req.relation === 1 || req.public) {
            const [comments] = await db.execute('SELECT comments.id as id, users.id as u_id, comment, reply, comments.updatedAt, first_name, last_name, profile_image  from comments JOIN users ON (comments.com_id = users.id) WHERE p_id = ?', [
                req.body.postId
            ]);
            res.status(200).json({ comments: comments });
        }
        else {
            res.status(401).json({ msg: "cannot access comments, unauthorized" });
        }
    }
    catch (error) {
        next(new Error(error));
    }
}

const deleteComment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [com_id] = await db.execute('SELECT com_id from comments where id = ?', [req.body.comId]);
        console.log(com_id);
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = {
    saveComment,
    getAllComments,
    deleteComment
};
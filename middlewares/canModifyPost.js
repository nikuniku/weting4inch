const { validationResult } = require('express-validator/check');

const db = require('../util/database');

const canModifyPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [result] = await db.execute('SELECT 1 FROM posts WHERE id = ? AND po_id = ?', [req.body.postId, req.userId]);
        if (result.length === 0) {
            return res.status(401).json({ msg: "cannot modify post" });
        }
        next();
    }
    catch (error) {
        new Error(error);
    }
}

module.exports = canModifyPost;
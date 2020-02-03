const { validationResult } = require('express-validator/check');

const db = require('../util/database');

const getPosterId = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [result] = await db.execute('SELECT po_id, public FROM posts WHERE id = ?', [req.body.postId]);
        if (result.length === 0) {
            return res.status(404).json({ msg: "post not found" });
        }
        req.u_id = result[0].po_id;
        req.public = result[0].public;
        next();
    }
    catch (error) {
        new Error(error);
    }
}

module.exports = getPosterId;
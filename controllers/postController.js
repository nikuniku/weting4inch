const { validationResult } = require('express-validator/check');

const db = require('../util/database');

const savePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const result = await db.execute('INSERT INTO posts (po_id, post, post_image, public) VALUES (?, ?, ?, ?)', [
            req.userId,
            req.body.post,
            req.body.post_image,
            req.body.public
        ]);
        res.status(200).json({ msg: "Post saved" });
    }
    catch (error) {
        next(new Error(error));
    }
}

const deletePost = async (req, res, next) => {
    try {
        const result = await db.execute('DELETE FROM posts WHERE id = ?', [req.body.postId]);
        res.status(200).json({ msg: "Post deleted" });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getPost = async (req, res, next) => {
    try {
        let query = 'SELECT posts.id AS p_id, po_id AS u_id, first_name, last_name, profile_image, posts.post_image, posts.updatedAt, post, public FROM posts JOIN users ON (posts.po_id = users.id) where posts.id = ?';
        if (req.relation !== -1 && req.relation !== 1) {
            query += ' AND public = 1';
        }
        const [post] = await db.execute(query, [req.body.postId]);
        const [likes] = await db.execute('SELECT u_id from likes where p_id = ?', [post[0].p_id]);
        const [comments] = await db.execute('SELECT count(*) as no_of_comments from comments where p_id = ?', [post[0].p_id]);
        const likAr = [];
        for (let j=0; j<likes.length; j++) {
            likAr.push(likes[j].u_id);
        }
        post[0].likes = likAr;
        post[0].noOfComments = comments[0].no_of_comments + ''; 
        res.status(200).json({ post: post, relation: req.relation, u_id: req.u_id, actionUser: req.actionUser, relId: req.relId });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getPosts = async (req, res, next) => {
    try {
        let query = 'SELECT posts.id AS p_id, po_id AS u_id, first_name, last_name, posts.post_image, profile_image, posts.updatedAt, post, public FROM posts JOIN users ON (posts.po_id = users.id) where users.email = ?';
        if (req.relation !== -1 && req.relation !== 1) {
            query += ' AND public = 1';
        }
        const [posts] = await db.execute(query, [req.body.email]);
        for (let i=0; i<posts.length; i++) {
            const [likes] = await db.execute('SELECT u_id from likes where p_id = ?', [posts[i].p_id]);
            const [comments] = await db.execute('SELECT count(*) as no_of_comments from comments where p_id = ?', [posts[i].p_id]);
            const likAr = [];
            for (let j=0; j<likes.length; j++) {
                likAr.push(likes[j].u_id);
            }
            posts[i].likes = likAr;
            posts[i].noOfComments = comments[0].no_of_comments + '';
        }
        res.status(200).json({ posts: posts, relation: req.relation, u_id: req.u_id, actionUser: req.actionUser, relId: req.relId });
    }
    catch (error) {
        next(new Error(error));
    }
}

const getFriendPosts = async (req, res, next) => {
    try {
        const [posts] = await db.execute('SELECT posts.id AS p_id, po_id AS u_id, first_name, last_name, profile_image, posts.post_image, posts.updatedAt, post, public FROM posts JOIN users ON (posts.po_id = users.id) WHERE po_id IN (SELECT id from users where id= ? UNION SELECT user_one FROM relationships WHERE user_two = ? AND status = 1 UNION SELECT user_two from relationships WHERE user_one = ? AND status = 1) ORDER BY posts.createdAt DESC', [req.userId, req.userId, req.userId]);
        for (let i=0; i<posts.length; i++) {
            const [likes] = await db.execute('SELECT u_id from likes where p_id = ?', [posts[i].p_id]);
            const [comments] = await db.execute('SELECT count(*) as no_of_comments from comments where p_id = ?', [posts[i].p_id]);
            const likAr = [];
            for (let j=0; j<likes.length; j++) {
                likAr.push(likes[j].u_id);
            }
            posts[i].likes = likAr;
            posts[i].noOfComments = comments[0].no_of_comments + '';
        }
        res.status(200).json({ posts: posts });
    }
    catch (error) {
        next(new Error(error));
    }
}

const likePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ msg: errors.array()[0].msg });
    }
    try {
        const [user] = await db.execute('SELECT first_name, last_name FROM users where id = ?', [req.userId]);
        const notif = user[0].first_name + ' has liked your post';
        const [result] = await db.execute('CALL likePost(?, ?, ?)', [req.body.postId, req.userId, notif]);
        res.status(200).json({ msg: 'liked/unliked' });
    }
    catch (error) {
        next(new Error(error));
    }
}

module.exports = {
    savePost,
    getPost,
    getPosts,
    getFriendPosts,
    likePost,
    deletePost
};
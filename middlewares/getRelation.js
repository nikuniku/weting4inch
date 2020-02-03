const db = require('../util/database');

const getRelation = async (req, res, next) => {
    try {
        let other = req.u_id;
        if (!other) {
            other = req.body.r_id;
        }
        const sm = (req.userId > other) ? other : req.userId;
        const gt = (req.userId < other) ? other : req.userId;
        if (sm === gt) {
            req.relation = -1;
            return next();
        }
        const [result] = await db.execute('SELECT id, status, action_user FROM relationships WHERE user_one = ? and user_two = ?', [sm, gt]);
        req.relId = result.length > 0 ? result[0].id : 0;
        req.relation = result.length > 0 ? result[0].status : -2;
        req.actionUser = result.length > 0 ? result[0].action_user : 0;
        next();
    }
    catch (error) {
        new Error(error);
    }
}

/*

RELATION CHART:
-2 => Users have no communication
-1 => Same user
 0 => Friend request sent by action_user
+1 => Users are friends

*/

module.exports = getRelation;
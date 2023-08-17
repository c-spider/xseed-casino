import db from "models";

export default async function handler(req, res) {
    const id = req.query.id;
    if(id > 0) {
        const data = await db.LotteryRound.findByPk(id, {
            include: [
                {
                    model: db.BuyRequest,
                    where: { score: {[db.Sequelize.Op.gt]: 0}, status: {[db.Sequelize.Op.eq]: 1}},
                    attributes: ['roundId', 'wallet', 'value', 'score', 'reward', 'paymentCoin', 'isWithdrawn', 'status']
                }
            ],
            order: [['id', 'DESC']]
        });
        res.status(200).json(data)
    } else {
        const data = await db.LotteryRound.findAll({
            include: [
                {
                    model: db.BuyRequest,
                    // where: { score: {[db.Sequelize.Op.gt]: 0}, status: 1},
                    attributes: ['roundId', 'wallet', 'value', 'score', 'reward', 'paymentCoin', 'isWithdrawn', 'status']
                }
            ],
            order: [['id', 'DESC']]
        });
        let pending = [];
        const wallet = req.body?.wallet;
        if(data.length > 0 && wallet?.length > 0) {
            pending = await db.BuyRequest.findAll({
                where : {
                    roundId: data[0].id,
                    status: 1,
                    wallet,
                }
            })
        }
        const pendingRoundId = data.length > 0 ? data[0].id : 0;
        const pendingRoundValue = data.length > 0 ? data[0].value : "000000";
        res.status(200).json({data, pending, pendingRoundId, pendingRoundValue})
    }
    
}
  
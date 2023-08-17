import db from "models";

export default async function handler(req, res) {
    const roundId = req.query.roundId;
    
        const data = await db.BuyRequest.findAll({
            where: { roundId },
            order: [['id', 'DESC']]
        });
        
        res.status(200).json(data)
}
  
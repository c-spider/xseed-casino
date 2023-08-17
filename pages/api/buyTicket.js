import db from "models";

function rand() {
    return ("000000" + Math.floor(Math.random() * 1000000)).slice(-6);
}

function findOverlaps(str1, str2) {
    let ans = "";
    let longest = "";
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] === str2[i]) {
            ans += str1[i];
            if (ans.length > longest.length) {
                longest = ans;
            }
        }
        else {
            ans = "";
        }
    }

    return longest;
}


export default async function handler(req, res) {
    if(req.method === "POST") {
        let pending = [];
        const wallet = req.body?.wallet;
        if(!wallet) {
            res.status(400).json({ error: `incorrect wallet address` });
            return ;
        }
        pending = await db.BuyRequest.findAll({
            where : {
                roundId: req.body.roundId,
                status: 1,
                wallet,
            }
        })

        if(pending.length > 0) {
            res.status(409).json({ error: `${pending.list} pending tickets` });
            return ;
        }

        const cnt = req.body.count;
        const values = [];

        const round = await db.LotteryRound.findByPk(req.body.roundId);

        for(let i = 0 ; i < cnt; i++) {
            const v = rand();
            values.push(v);
            const tx = await db.BuyRequest.build({
                wallet: req.body.wallet,
                roundId: req.body.roundId,
                paymentCoin: req.body.paymentCoin,
                value: v,
                score: findOverlaps(round.value, v).length,
                reward: 0,
                isWithdrawn: false,
                status: 1
            })
            await tx.save();
        }
        res.status(200).json({ values })
        
    }
  }
  
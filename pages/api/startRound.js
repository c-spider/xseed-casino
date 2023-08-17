import {ethers} from 'ethers';
import { LOTTERY_ABI } from 'config/abi';
import db from "models";

function rand() {
    return ("000000" + Math.floor(Math.random() * 1000000)).slice(-6);
}

export default async function handler(req, res) {
    if(req.method === "POST") {
        const t = new Date();
        const timestamp = parseInt(t.getTime()/1000);
        let round = await db.LotteryRound.findOrCreate({
            where: {
                id: req.body.roundId
            },
            defaults: {
                value: rand(),
                hash: "",
                totalPrize: "0",
                status: 0,
                startAt: timestamp,
                endAt: timestamp
            }
        });
        // if(round)
        //     await round.save();
        

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPCURL);
        const wallet = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
        const lotteryContract = new ethers.Contract(process.env.LOTTERY_ADDRESS, LOTTERY_ABI, wallet);
        try {
            const R = await db.LotteryRound.findByPk(req.body.roundId);
            console.log("---------------------", req.body.roundId, R.value);
            const tx = await lotteryContract.startRound("" + R.id, "" + R.value);
            console.log("transaction Hash", tx.hash);

            R.status = 1;
            R.hash = tx.hash;
            await R.save();
        } catch (e) {
            res.status(400).json({eror: "Unable to start transaction"})
        }

        const data = await db.LotteryRound.findAll({order: [['id', 'DESC']]});
        res.status(200).json(data)
    }
}
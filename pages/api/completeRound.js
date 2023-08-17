import {ethers} from 'ethers';
import { LOTTERY_ABI } from 'config/abi';
import db from "models";

function rand() {
    return ("000000" + Math.floor(Math.random() * 1000000)).slice(-6);
}

export default async function handler(req, res) {
    if(req.method === "POST") {
        try {
            const round = await db.LotteryRound.findByPk(req.body.roundId);
            const provider = new ethers.providers.JsonRpcProvider(process.env.RPCURL);
            const wallet = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
            const lotteryContract = new ethers.Contract(process.env.LOTTERY_ADDRESS, LOTTERY_ABI, wallet);

            const tx = await lotteryContract.completeRound(req.body.roundId);
            round.status = 3;
            await round.save();
        } catch (e) {
            console.log("Round cannot completed", e);
            res.status(400).json("Error");

        }
        
        const data = await db.LotteryRound.findAll({order: [['id', 'DESC']]});
        res.status(200).json(data)
    }
}
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import Web3 from "web3";
import { useAccount } from "wagmi";
import Image from "next/image";
import Moment from "react-moment";

import { LOTTERY_ADDRESS, LOTTERY_TOKEN, RPCURL } from "config/address";
import { LOTTERY_ABI } from "config/abi";
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon";
import { faArrowsRotate, faClose } from "@fortawesome/free-solid-svg-icons";
import CLIENT_API from "api";
import { hideOverlay, showOverlay } from "store/slices/utilSlice";
import { toast } from "react-toastify";
import { BarLoader } from "react-spinners";
import { useUtil } from "store/hook";


export default function SettingDlg() {
    const dispatch = useDispatch();

    const { lotteryPrice } = useUtil();
    const { isConnected, address } = useAccount();
    const [isLoading, setLoading] = useState(true);

    const [roundId, setRoundId] = useState(0);
    const [rewards, setRewardsRule] = useState({ old: [5.00, 2.00, 5.00, 8.00, 10.00, 15.00, 50.00, 5.00], new: [5.00, 2.00, 5.00, 8.00, 10.00, 15.00, 50.00, 5.00] })
    const [ticketCounts, setTicketCounts] = useState([0, 0, 0, 0, 0, 0])
    const [isRunning, setIsRunning] = useState(false);
    const [feeWallet, setFeeWallet] = useState({ old: "", new: "" });
    const [burnAddress, setBurnAddress] = useState({ old: "", new: "" });
    const [totalPrize, setTotalPrize] = useState(0);
    const [isRewardsUpdated, requireRewardSave] = useState(false);
    const [ticketValue, setTicketValue] = useState("000000");

    const [roundDuration, setRoundDuration] = useState({ old: 3000, new: 3000 });
    const [ticketPrice, setTicketPrice] = useState({ old: 1, new: 1 });
    const [nextTicketPrice, setNextTicketPrice] = useState({ old: 1, new: 1 });
    const [totalFee, setTotalFee] = useState(0);

    useEffect(() => {
        getRoundStatus();
    }, [])

    const getRoundStatus = async () => {
        try {
            setLoading(true);
            const web3_read = new Web3(RPCURL);
            const lotteryContract = new web3_read.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const res = await callSmartContract(lotteryContract, "getRoundStatus", []);

            console.log(res);
            setRoundId(parseInt(res.roundData[0]));
            setRewardsRule({ old: res.rewardPercentages.map((v) => parseInt(v) / 100.0), new: res.rewardPercentages.map((v) => parseInt(v) / 100.0) });
            setTicketCounts(res._winCounts);
            setIsRunning(res._isRunning);
            setFeeWallet({ old: res.feeWallet, new: res.feeWallet })
            setBurnAddress({ old: res.burnAddr, new: res.burnAddr })
            setTotalPrize(parseFloat(Web3.utils.fromWei(res.roundData[1])).toFixed(3))
            // setNextTotalPrize(parseFloat(Web3.utils.fromWei(res._NextRoundPrice)).toFixed(3))
            setTicketValue(`000000${res._value}`.slice(-6));
            setTotalFee(parseFloat(Web3.utils.fromWei(res.roundData[5].toString())).toFixed(3));

            setRoundDuration({ old: res.roundData[4], new: res.roundData[4] });
            setTicketPrice({ old: parseFloat(Web3.utils.fromWei(res.roundData[2])).toFixed(3), new: parseFloat(Web3.utils.fromWei(res.roundData[2])).toFixed(3) });
            setNextTicketPrice({ old: parseFloat(Web3.utils.fromWei(res.roundData[3])).toFixed(3), new: parseFloat(Web3.utils.fromWei(res.roundData[3])).toFixed(3) });


            // const a = Web3.utils.toBN("" + res[1]);
            // const b = Web3.utils.toBN(Web3.utils.toWei("" + ticketCount));
            // setAllowanceAmount(parseFloat(Web3.utils.fromWei(res[1])));
            // setBalance(parseFloat(Web3.utils.fromWei(res[0])));
            // setApproved(a.gte(b));
            // requireRewardSave(false);
            setLoading(false);
            return;
        } catch (e) {
            setLoading(false);
            console.log(e);
            // setAllowanceAmount(0)
        }
    }


    const onUpdateReward = (index, value) => {
        const tmp = JSON.parse(JSON.stringify(rewards.new));
        tmp[index] = value;
        let f = false;
        for (let i = 0; i < 8; i++) {
            if (tmp[i] != rewards.old[i]) {
                requireRewardSave(true);
                f = true;
            }
        }
        if (!f)
            requireRewardSave(false);
        setRewardsRule({ ...rewards, new: [...tmp] });
    }

    const onSaveRewards = async (amount) => {
        dispatch(showOverlay("Updating Reward percentages~"));
        try {
            const web3 = new Web3(Web3.givenProvider);
            const lotteryContract = new web3.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const { success, gas, message } = await estimateGas(lotteryContract, "setRewards", 0, [rewards.new]);

            if (!success) {
                const m = decodeError(message);
                toast.error("Transaction Failed" + m);
                return;
            }

            console.log("updating", rewards.new.map((item) => 100 * item))
            const res = await runSmartContract(lotteryContract, "setRewards", 0, [rewards.new.map((item) => 100 * item)])
            toast.success("Successfully purchased");
            dispatch(hideOverlay());
            return;
        } catch (e) {
        }
        dispatch(hideOverlay());

        toast.error("Transaction Failed");
    }

    const onStartRound = async () => {
        dispatch(showOverlay(`Starting Round ${roundId + 1}`));
        const res = await CLIENT_API.startRound(roundId + 1);

        // res.map((round) => {
        //     if(round.status > 0 && round.status < 3) {
        //         setRunning(true);
        //     }
        // })
        setIsRunning(true);
        dispatch(hideOverlay());
        getRoundStatus();
    }

    const onCompleteRound = async () => {
        dispatch(showOverlay("Round Completed. Sending Rewards..."));

        const res = await CLIENT_API.completeRound(roundId);
        const f = res.filter((item) => item.status < 3).length;
        // if (f > 0)
        //     setRoundList([...res]);
        // else
        //     setRoundList([...res]);

        setIsRunning(false);

        // res.map((round) => {
        //     if(round.status > 0 && round.status < 3) {
        //         setIsRunning(true);
        //     }
        // })
        dispatch(hideOverlay());
    }

    const onSaveWallets = async () => {
        dispatch(showOverlay("Updating wallet addresses"));
        try {
            if (!isAddress(feeWallet.new) || !isAddress(burnAddress.new)) {
                toast.error("Incorrect address format");
                return;
            }
            const web3 = new Web3(Web3.givenProvider);
            const lotteryContract = new web3.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const { success, gas, message } = await estimateGas(lotteryContract, "setWallets", 0, [feeWallet.new, burnAddress.new]);

            if (!success) {
                const m = decodeError(message);
                toast.error("Transaction Failed." + m);
                return;
            }

            console.log("updating", [feeWallet.new, burnAddress.new])
            const res = await runSmartContract(lotteryContract, "setWallets", 0, [feeWallet.new, burnAddress.new])
            toast.success("Successfully purchased");
            dispatch(hideOverlay());
            return;
        } catch (e) {
        }
        dispatch(hideOverlay());

        toast.error("Transaction Failed");
    }

    const onSaveDurationAndPrice = async () => {
        dispatch(showOverlay("Updating Round Duration & Price"));
        try {
            const web3 = new Web3(Web3.givenProvider);
            const lotteryContract = new web3.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const { success, gas, message } = await estimateGas(lotteryContract, "setDurationAndPrice", 0, [roundDuration.new, Web3.utils.toWei(nextTicketPrice.new)]);

            if (!success) {
                const m = decodeError(message);
                toast.error("Transaction Failed" + m);
                return;
            }

            console.log("updating", [roundDuration.new, Web3.utils.toWei(nextTicketPrice.new)])
            const res = await runSmartContract(lotteryContract, "setDurationAndPrice", 0, [roundDuration.new, Web3.utils.toWei(nextTicketPrice.new)])
            toast.success("Successfully purchased");
            dispatch(hideOverlay());
            return;
        } catch (e) {
        }
        dispatch(hideOverlay());

        toast.error("Transaction Failed");
    }

    return (
        <div className="w-full mt-[100px] mb-[20px] min-w-[calc(100%-100px)] flex flex-col bg-[#20182C] md:p-[50px] p-[20px] rounded-[16px]">
            <div className="flex items-center mb-[20px]">
                <p className="text-[1.5rem] text-[white]"> Game Status <span className="text-[#a0a0a0] text-[1rem]"> (Round {roundId})</span> </p>
                <div className="grow"></div>
                {!isRunning &&

                    <button className="bg-[#30ff30] opacity-80 hover:opacity-100 h-[40px] rounded-full px-[40px] text-black mr-[1rem]"
                        onClick={() => { onStartRound() }}
                    > Start Round <span className="font-bold"> {roundId+1}</span></button>
                }
                {isRunning &&
                    <button className="bg-primary opacity-100 hover:opacity-80 h-[40px] rounded-full px-[40px] text-[white] mr-[1rem]"
                        onClick={() => { onCompleteRound() }}
                    > Complete Round <span className="font-bold"> {roundId}</span></button>
                }
                <button className="flex flex-col items-center justify-center relative bg-[#282454] hover:bg-[#6639E4] opacity-100 hover:opacity-80 h-[40px] rounded-full px-[40px] text-[white] transition-all duration-150"
                    onClick={() => { getRoundStatus() }}
                >
                    <div className="flex items-center justify-center">
                        <FontAwesomeSvgIcon icon={faArrowsRotate} width={16} height={16} color="white" />
                        <p className="ml-[1rem]">Refresh</p>
                    </div>
                    {isLoading &&
                        <BarLoader width={80} color="white" />
                    }
                </button>
            </div>
            <div className="flex flex-wrap">
                <div className="flex">
                    <div className="flex flex-col p-[1rem] rounded-[1rem]">
                        <div className="flex items-center mb-[1rem]">
                            <h4 className="text-[1.25rem] font-bold text-white mr-[0.5rem]"> Reward Rules </h4>
                            <FontAwesomeSvgIcon icon={faArrowsRotate} width={16} height={16} color="white" />
                        </div>
                        <div className="flex">
                            <div className="flex flex-col text-right w-fit text-[#a0a0a0] leading-[1.5rem]">
                                <p className="mb-[0.5rem] leading-[1.75rem]"> ALL <span className="font-bold text-white">6</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">5</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">4</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">3</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">2</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">1</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Service Fee :</p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Burn :</p>
                            </div>
                            <div className="flex flex-col grow ml-[1rem]">
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[6] == rewards.old[6] ? "white" : "#30ff30" }} value={rewards.new[6]} onChange={(e) => { onUpdateReward(6, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[5] == rewards.old[5] ? "white" : "#30ff30" }} value={rewards.new[5]} onChange={(e) => { onUpdateReward(5, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[4] == rewards.old[4] ? "white" : "#30ff30" }} value={rewards.new[4]} onChange={(e) => { onUpdateReward(4, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[3] == rewards.old[3] ? "white" : "#30ff30" }} value={rewards.new[3]} onChange={(e) => { onUpdateReward(3, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[2] == rewards.old[2] ? "white" : "#30ff30" }} value={rewards.new[2]} onChange={(e) => { onUpdateReward(2, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[1] == rewards.old[1] ? "white" : "#30ff30" }} value={rewards.new[1]} onChange={(e) => { onUpdateReward(1, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[0] == rewards.old[0] ? "white" : "#30ff30" }} value={rewards.new[0]} onChange={(e) => { onUpdateReward(0, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[100px]">
                                    <input type="number" style={{ color: rewards.new[7] == rewards.old[7] ? "white" : "#30ff30" }} value={rewards.new[7]} onChange={(e) => { onUpdateReward(7, parseInt(e.target.value)) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]">%</p>
                                </div>
                            </div>

                        </div>
                        <div className="flex justify-end pt-[0.5rem]">
                            <button className="bg-primary disabled:opacity-50 h-[40px] rounded-full px-[1.5rem] text-white" disabled={!isRewardsUpdated}
                                onClick={() => { onSaveRewards() }}
                            > Save </button>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    <div className="flex flex-col p-[1rem] rounded-[1rem]">
                        <div className="flex items-center mb-[1rem]">
                            <h4 className="text-[1.25rem] font-bold text-white mr-[0.5rem]"> Round Details </h4>
                            <FontAwesomeSvgIcon icon={faArrowsRotate} width={16} height={16} color="white" />
                        </div>
                        <div className="flex">
                            <div className="flex flex-col text-right w-fit text-[#a0a0a0] leading-[1.5rem]">
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Round duration: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Ticket Price: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Ticket Price(Next Round): </p>
                            </div>
                            <div className="flex flex-col grow ml-[1rem]">
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem]">
                                    <input type="text" value={roundDuration.new} onChange={(e) => { setRoundDuration({ ...roundDuration, new: e.target.value }) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]"> Seconds </p>
                                    {roundDuration.old != roundDuration.new &&
                                        <button className="min-w-[24px] h-[24px] rounded-full bg-[#303030] flex justify-center items-center -mr-[0.75rem] ml-[0.25rem]"
                                            onClick={() => { setRoundDuration({ ...roundDuration, new: roundDuration.old }) }}
                                        >
                                            <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                                        </button>
                                    }
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem]">
                                    <input type="text" readOnly value={ticketPrice.new} onChange={(e) => { setTicketPrice({ ...ticketPrice, new: e.target.value }) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]"> $LTR </p>
                                    {ticketPrice.old != ticketPrice.new &&
                                        <button className="min-w-[24px] h-[24px] rounded-full bg-[#303030] flex justify-center items-center -mr-[0.75rem] ml-[0.25rem]"
                                            onClick={() => { setTicketPrice({ ...ticketPrice, new: ticketPrice.old }) }}
                                        >
                                            <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                                        </button>
                                    }
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem]">
                                    <input type="text" value={nextTicketPrice.new} onChange={(e) => { setNextTicketPrice({ ...nextTicketPrice, new: e.target.value }) }} className="outline-none bg-transparent w-full text-right" />
                                    <p className="text-[0.75rem] text-[#a0a0a0] ml-[0.25rem]"> $LTR </p>
                                    {nextTicketPrice.old != nextTicketPrice.new &&
                                        <button className="min-w-[24px] h-[24px] rounded-full bg-[#303030] flex justify-center items-center -mr-[0.75rem] ml-[0.25rem]"
                                            onClick={() => { setNextTicketPrice({ ...nextTicketPrice, new: nextTicketPrice.old }) }}
                                        >
                                            <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-[0.5rem]">
                            <button className="bg-primary disabled:opacity-50 h-[40px] rounded-full px-[1.5rem] text-white"
                                onClick={() => { onSaveDurationAndPrice() }} disabled={nextTicketPrice.old == nextTicketPrice.new && ticketPrice.old == ticketPrice.new && roundDuration.old == roundDuration.new}
                            > Save </button>
                        </div>
                        <div className="flex items-center mb-[1rem]">
                            <h4 className="text-[1.25rem] font-bold text-white mr-[0.5rem]"> Reward Wallets </h4>
                            <FontAwesomeSvgIcon icon={faArrowsRotate} width={16} height={16} color="white" />
                        </div>
                        <div className="flex">
                            <div className="flex flex-col text-right w-fit text-[#a0a0a0] leading-[1.5rem]">
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Fee Wallet: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Burn Address: </p>
                            </div>
                            <div className="flex flex-col grow ml-[1rem]">
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem]">
                                    <input type="text" style={{ color: isAddress(feeWallet.new) ? "white" : "red" }} value={feeWallet.new} onChange={(e) => { setFeeWallet({ ...feeWallet, new: e.target.value }) }} className="outline-none bg-transparent w-full text-right text-[0.75rem]" />
                                    {feeWallet.old != feeWallet.new &&
                                        <button className="min-w-[24px] h-[24px] rounded-full bg-[#303030] flex justify-center items-center -mr-[0.75rem] ml-[0.25rem]"
                                            onClick={() => { setFeeWallet({ ...feeWallet, new: feeWallet.old }) }}
                                        >
                                            <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                                        </button>
                                    }
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem]">
                                    <input type="text" style={{ color: isAddress(burnAddress.new) ? "white" : "red" }} value={burnAddress.new} onChange={(e) => { setBurnAddress({ ...burnAddress, new: e.target.value }) }} className="outline-none bg-transparent w-full text-right text-[0.75rem]" />
                                    {burnAddress.old != burnAddress.new &&
                                        <button className="min-w-[24px] h-[24px] rounded-full bg-[#303030] flex justify-center items-center -mr-[0.75rem] ml-[0.25rem]"
                                            onClick={() => { setBurnAddress({ ...burnAddress, new: burnAddress.old }) }}
                                        >
                                            <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-[0.5rem]">
                            <button className="bg-primary disabled:opacity-50 h-[40px] rounded-full px-[1.5rem] text-white"
                                onClick={() => { onSaveWallets() }} disabled={feeWallet.old == feeWallet.new && burnAddress.old == burnAddress.new}
                            > Save </button>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="flex flex-col p-[1rem] rounded-[1rem]">
                        <div>
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[0]}.png`} />
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[1]}.png`} />
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[2]}.png`} />
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[3]}.png`} />
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[4]}.png`} />
                            <Image alt="" width={36} height={36} src={`/images/digits/0${String(ticketValue)[5]}.png`} />
                        </div>
                        <div className="flex items-center">
                            <h4 className="text-[1.25rem] font-bold text-white mr-[0.5rem]"> Prize Pot: <span className="text-[1.5rem] font-bold text-[yellow]">{totalPrize}</span> <span className="text-[0.75rem] text-[#a0a0a0]">$LTR</span> </h4>
                        </div>
                        <div className="flex items-center mn-[0.25rem]">
                            <p className="text-[.875rem] mr-[0.5rem] text-[#a0a0a0]"> Lottery Price: <span className="text-[1rem] font-bold text-[#e0e0e0]">{lotteryPrice}</span> <span className="text-[0.75rem] text-[#a0a0a0]">$USDT</span> </p>
                        </div>
                        <div className="flex items-center mb-[.5rem] pt-[1rem] border-t-[1px] border-[#a0a0a0]">
                            <h4 className="text-[1.25rem] font-bold text-white mr-[0.5rem]"> Winners <span className="text-[#a0a0a0]">(Round {roundId})</span> </h4>
                        </div>
                        <div className="flex">
                            <div className="flex flex-col text-right w-fit text-[#a0a0a0] leading-[1.75rem]">
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">6</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">5</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">4</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">3</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">2</span>: </p>
                                <p className="mb-[0.5rem] leading-[1.75rem]"> Match <span className="font-bold text-white">1</span>: </p>
                            </div>
                            <div className="flex flex-col grow ml-[1rem]">
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[6]}</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[5]}</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[4]}</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[3]}</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[2]}</p>
                                </div>
                                <div className="flex justify-between items-center mb-[0.5rem] leading-[1.75rem] text-white bg-[#a0a0a050] rounded-full px-[1rem] max-w-[80px]">
                                    <p className="text-[0.75rem] text-[#a0a0a0] text-center w-full"> 0{ticketCounts[1]}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )


    // Read
    async function callSmartContract(contract, func, args) {
        if (!contract) return false;
        if (!contract.methods[func]) return false;
        return contract.methods[func](...args).call();
    }

    // Write
    async function runSmartContract(contract, func, value, args) {
        if (!isConnected) return false;
        if (!contract) return false;
        if (!contract.methods[func]) return false;
        return await contract.methods[func](...args).send({ from: address, value: value })
    }

    async function estimateGas(contract, func, value, args) {
        try {
            const gasAmount = await contract.methods[func](...args).estimateGas({ from: address, value: value });
            return {
                success: true,
                gas: gasAmount
            }
        } catch (e) {
            console.error(e);
            if (e.message.startsWith("Internal JSON-RPC error.")) {
                e = JSON.parse(e.message.substr(24));
            }
            return {
                success: false,
                gas: -1,
                message: e.message
            }
        }
    }

    function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // Check if it has the basic requirements of an address
            return false;
        } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address.toLowerCase()) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            return isChecksumAddress(address);
        }
    }

    function isChecksumAddress(address) {
        address = address.replace(/^0x/i, '');
        var addressHash = Web3.utils.keccak256(address.toLowerCase());
        for (var i = 0; i < 40; i++) {
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
                (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    }


    function decodeError(error) {
        // If the error is just a string, return it
        if (typeof error === 'string') {
            return error;
        }

        // If the error has a message property, return it
        if (error && error.message) {
            return error.message;
        }

        // If the error object has a more complex structure, you may need to dive deeper. 
        // For instance, MetaMask used to nest Ethereum error messages:
        if (error && error.data && error.data.message) {
            return error.data.message;
        }

        // If none of the above, just return a generic error message
        return "An unknown error occurred.";
    }

}
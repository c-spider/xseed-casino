import Image from "next/image"
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon"
import { faAngleDown, faAngleUp, faClose, faPlus, faMinus, faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { Web3Button, useWeb3Modal } from "@web3modal/react";
import Moment from "react-moment";
import { useAccount } from "wagmi";
import CLIENT_API from "api";

import Web3 from "web3";
import { BEP20_ABI, LOTTERY_ABI } from "config/abi";
import { LOTTERY_ADDRESS, LOTTERY_TOKEN, RPCURL } from "config/address";

import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { hideOverlay, setRoundList, showOverlay } from "store/slices/utilSlice";
import { ClipLoader, CircleLoader, BarLoader, PulseLoader, RingLoader } from "react-spinners";
import { useUtil } from "store/hook";

export default function LotteryCard({ data, isOpen, hasPending }) {
    const dispatch = useDispatch();

    const { ticketPrice, lotteryPrice, roundId, isRunning } = useUtil();
    const { open, close } = useWeb3Modal();
    const { isConnected, address } = useAccount();
    const [isTickets, openTickets] = useState(false);
    const [isBuyModal, openBuyModal] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [balance, setBalance] = useState(0);
    const [allowance, setAllowanceAmount] = useState(0);
    const [isApproved, setApproved] = useState(false);

    const [startTime, setStartTime] = useState(new Date(parseInt(1000 * data.startAt)));
    const [endTime, _setEndTime] = useState(new Date(parseInt(1000 * data.endAt)))

    const [isDetails, openDetails] = useState(isOpen);
    const [isLoadingDetails, setLoadingDetails] = useState(false);
    const [details, setDetails] = useState({});

    const [totalPrize, setTotalPrize] = useState(Web3.utils.fromWei(data.totalPrize));
    const [winCounts, setWinnerCounts] = useState([]);
    const [totalWinCounts, setTotalWinnersCnt] = useState(0);

    const [tickets, setMyTickets] = useState([]);

    useEffect(() => {
        if (address) {
            checkApproved();
        }
    }, [address])

    useEffect(() => {
        if (address) {
            const _tickets = []
            for (let i = 0; i < data.BuyRequests?.length; i++) {
                if (data.BuyRequests[i].wallet == address) {
                    if (data.BuyRequests[i].score > 0 && data.BuyRequests[i].status == 0)
                        _tickets.push(data.BuyRequests[i]);
                }
            }
            setMyTickets(_tickets);
        }
        _setEndTime(new Date(parseInt(data.endAt)));
        
    }, [address, data])

    useEffect(() => {
        if (ticketCount > allowance)
            setApproved(false);
        else
            setApproved(true);
    }, [ticketCount])

    const onBuyModal = async () => {
        checkApproved();
        openBuyModal(true);
    }

    const loadDetails = async () => {
        const web3_read = new Web3(RPCURL);
        const lotteryContract = new web3_read.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);
        const res = await callSmartContract(lotteryContract, "getRoundStatus", []);

        const p = [0, 2, 5, 8, 10, 15, 50]
        const t = parseFloat(Web3.utils.fromWei(res.roundData[1]));
        setTotalPrize(t);
        const dataList = [];
        let cnt = 0;
        for (let i = 0; i < 6; i++) {
            const count = parseInt(res._winCounts[6 - i]);
            const total = t * p[6 - i] / 100.0;
            const each = total / (count > 0 ? count : 1);
            cnt += count;
            dataList.push({ total, count, each, match: 6 - i });
        }
        setWinnerCounts([...dataList]);
        setTotalWinnersCnt(cnt);
        console.log("details", dataList);
        setDetails(res);
    }

    const onDetailsClicked = async (f) => {
        if (f && data.status > 0) {
            if (data.status < 3 || Object.keys(details).length == 0)
                try {
                    setLoadingDetails(true);
                    await loadDetails();
                    setLoadingDetails(false);
                } catch (e) {
                    setLoadingDetails(false);
                }
        }
        openDetails(f);
    }


    const loadRoundInfo = async () => {
        const res = await CLIENT_API.getRounds(address);
        dispatch(setRoundList({ roundList: [...res.data.map((item) => { return { ...item, isStarted: true } })] }));
    }

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

    const onApproveClicked = async () => {
        if (allowance < ticketCount) {
            await setAllowance();
        }
    }

    async function setAllowance() {
        dispatch(showOverlay("Running"));

        try {
            const web3 = new Web3(Web3.givenProvider);
            const tokenContract = new web3.eth.Contract(BEP20_ABI, LOTTERY_TOKEN);

            const am = Web3.utils.toBN(ticketPrice).mul(Web3.utils.toBN(ticketCount)).toString();
            const args = [LOTTERY_ADDRESS, am];
            const func = "approve";

            const { success, gas, message } = await estimateGas(tokenContract, func, 0, args);

            if (!success) {
                toast.error("Incorrect RPC URL", message);
                console.log(message);
                return;
            }
            const res = await runSmartContract(tokenContract, func, 0, args)
            toast.success("Successfully approved");
            dispatch(hideOverlay());
            await checkApproved();
            return;
        } catch (e) {
        }
        dispatch(hideOverlay());
        toast.error("Transaction Failed.")
    }

    async function buyToken(amount) {
        if(hasPending) {
            toast.error(hasPending ? "You have pending tickets." : "Network issue!");
            return ;
        }
        dispatch(showOverlay("Running"));
        try {
            const web3 = new Web3(Web3.givenProvider);
            const lotteryContract = new web3.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const { success, gas, message } = await estimateGas(lotteryContract, "buy", 0, [LOTTERY_TOKEN, [123456, 123456]]);

            if (!success) {
                const m = decodeError(message);
                toast.error("Transaction Failed" + m);
                return;
            }

            const values = await CLIENT_API.buyTicket(ticketCount, data.id, address, LOTTERY_TOKEN);
            if(values?.length != ticketCount) {
                toast.error(values.hasPending ? "You have pending tickets." : "Network issue!");
                dispatch(hideOverlay());
                return;
            }
            const args = [LOTTERY_TOKEN, values];
            const res = await runSmartContract(lotteryContract, "buy", 0, args)
            toast.success("Successfully purchased");
            checkApproved();
            loadDetails();
            dispatch(hideOverlay());
            openBuyModal(false);
            return;
        } catch (e) {
            console.log(e);
        }
        dispatch(hideOverlay());

        toast.error("Transaction Failed");
    }

    const checkApproved = async () => {
        try {
            const web3_read = new Web3(RPCURL);
            const lotteryContract = new web3_read.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const res = await callSmartContract(lotteryContract, "getTokenStatus", [address, LOTTERY_TOKEN]);

            const a = Web3.utils.toBN("" + res[1]);
            const b = Web3.utils.toBN(ticketPrice).mul(Web3.utils.toBN(ticketCount));
            setAllowanceAmount(parseFloat(Web3.utils.fromWei(res[1])));
            setBalance(parseFloat(Web3.utils.fromWei(res[0])));
            setApproved(a.gte(b));
            return;
        } catch (e) {
            console.log(e);
            setAllowanceAmount(0)
        }
    }

    return (
        <div className="2xl:min-w-[33.33%] md:min-w-[50%] min-w-[100%] p-[0.5rem]">

        <div className="bg-[#282828a0] rounded-[1rem] flex flex-col p-[2rem] border-[5px] border-[#ffffff60] h-fit transition-all duration-300">
            <div className="flex justify-between">
                <p className="text-white lg:text-[2rem] md:text-[1.5rem] text-[2rem] font-medium">Winning Number</p>
                <div className="flex flex-col items-end text-right text-white">
                    <p className="text-[1.25rem] font-bold"> {data.id} </p>
                    <p> Round No.</p>
                </div>
            </div>
            <div className="flex space-[0.5rem] mt-[0.75rem] items-center">
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[0]}.png`} />
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[1]}.png`} />
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[2]}.png`} />
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[3]}.png`} />
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[4]}.png`} />
                <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[5]}.png`} />
                <div className="grow min-w-[1rem]"></div>
                {data.status > 0 ?
                    <p className="text-white text-[1.25rem] text-right"> {parseFloat(totalPrize).toFixed(3)} $LTR </p> :
                    <div className="flex flex-col items-center text-white">
                        <p> Starting Soon</p>
                        <BarLoader color="white" />
                    </div>
                }
            </div>
            {data.isStarted &&
                <>
                    <div className="flex flex-col text-white text-[1rem] leading-[2rem] mt-[2rem]">
                        <div className="flex items-center">
                            <p className="grow text-[#a7a9ba] text-[0.875rem]"> Withdraw date: </p>
                            <p className="grow text-right text-[0.875rem]"> <Moment format="ddd, MMM D, yyyy hh:mm" date={new Date(1000 * parseInt(data.endAt))} /></p>
                        </div>
                        <div className="flex items-center">
                            <p className="grow text-[#a7a9ba] text-[0.875rem]"> Total <span className="font-bold text-[1rem] text-white"> {data.BuyRequests?.length} win tickets </span> sold.</p>
                            {isConnected &&
                                <>
                                    <p className="grow text-right text-[#a7a9ba]  text-[0.875rem]"> You have <span className="font-bold text-white">{tickets?.length}</span> tickets this round.</p>
                                    <button className="p-[0.5rem]" onClick={() => {
                                        loadRoundInfo();
                                    }}>
                                        <FontAwesomeSvgIcon icon={faArrowsRotate} width={16} height={16} />
                                    </button>                            
                                </>
                            }
                        </div>
                        <div className="flex justify-end">
                            {isConnected && data.status > 0 && data.status < 3 &&
                                <button className="bg-[#ffd50f] text-black px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem] mr-[.5rem]"
                                    onClick={() => { onBuyModal() }}>
                                    Buy Tickets
                                </button>
                            }
                            {isConnected && data.status > 0 && tickets.length > 0 &&
                                <button className="bg-[#20ff40] text-black px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem]"
                                    onClick={() => { openTickets(true) }}
                                > View Tickets </button>
                            }
                        </div>
                    </div>
                    <div className="border-[gray] border-t-[1px] mt-[1.5rem] pt-[1.5rem] text-white">
                        <p className="text-[0.875rem]"> Prize Pot: <span className="font-bold text-[1rem]">{parseFloat(totalPrize).toFixed(3)}</span> $LTR </p>
                        <p className="text-[0.875rem]">Match the winning number in the same order to share prizes. </p>
                    </div>
                </>

            }
            {data.isStarted && isDetails &&
                <div className="flex flex-col mt-[0.75rem]">
                    <div className="flex flex-col">
                        <p className="text-[1rem] font-medium text-white"> Total Winners: <span className="font-bold"> {totalWinCounts} </span> </p>
                        {winCounts.map((item, index) =>
                            <div key={index} className="flex flex-col border-b-[1px] border-b-gray-500 mb-[0.5rem]">
                                <p className="text-[0.875rem] font-medium text-white"> Match {item.match} </p>
                                <div className="flex text-white text-[0.75rem]">
                                    <p className="w-[120px]"> <span className="font-bold text-[0.875rem]">{item.total.toFixed(3)}</span> $LTR </p>
                                    <p className="w-[120px]"> <span className="font-bold text-[0.875rem]">{item.each.toFixed(3)}</span> $LTR Each </p>
                                    <p className="grow text-right"> <span className="font-bold text-[0.875rem]">{item.count} </span> Winning tickets </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
            {data.isStarted &&
                <div className="flex text-white text-[1rem] leading-[2rem] mt-[1rem]">
                    <div className="grow flex items-center justify-center">
                        <Image src="/images/xseed.png" alt="" width={80} height={80} />
                    </div>
                    <div className="flex items-start">
                        <button className="flex items-center font-medium" onClick={() => { onDetailsClicked(!isDetails) }}>
                            <p className="mr-[0.25rem]">Details</p>
                            {!isLoadingDetails ?
                                <FontAwesomeSvgIcon icon={isDetails ? faAngleUp : faAngleDown} width={24} height={24} /> :
                                <BarLoader color="white" width={24} />
                            }
                        </button>
                    </div>
                </div>
            }
            {isTickets &&
                <div className="fixed w-[100vw] h-[100vh] top-0 left-0 flex justify-center items-center backdrop-blur-md z-50"
                    onClick={() => { openTickets(false) }}
                >
                    <div className="bg-[#282828a0] rounded-[1rem] flex flex-col p-[1rem] border-[5px] border-[#ffffff60]">
                        <div className="flex justify-between items-center text-white mb-[0.5rem]">
                            <p className="text-[1.5rem]"> Round {data.id} <span className="text-[1rem] text-[#808080]">({tickets.length} Tickets)</span> </p>
                            <button className="">
                                <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                            </button>
                        </div>
                        <div className="flex space-[0.5rem] mt-[0.75rem] items-center border-b-[2px] border-[#707070] pb-[0.5rem] mb-[1rem]">
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[0]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[1]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[2]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[3]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[4]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(data.value)[5]}.png`} />
                            <div className="grow"></div>
                            
                        </div>
                        {tickets?.length == 0 &&
                            <p className="text-[#a7a9ba]"> You have no ticket for this round </p>
                        }
                        <div className="flex flex-col max-h-[320px] overflow-y-auto scrollbar">
                        {tickets.map((ticket, index) =>
                            <div key={index} className="flex mt-[0.5rem] mr-[1rem]">
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[0]}.png`} />
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[1]}.png`} />
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[2]}.png`} />
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[3]}.png`} />
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[4]}.png`} />
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket.value[5]}.png`} />
                                <div className="min-w-[10rem]" />
                                <p className="text-[#a0a0a0] text-[0.875rem]"> Match <span className="font-bold text-white text-[1.25rem]">{ticket.score}</span> </p>
                            </div>
                        )}
                        </div>
                        
                        {/* <div className="border-t-[1px] border-[#a7a9ba] mt-[0.5rem] flex justify-end py-[0.5rem]">
                            <button className="bg-[#a7a9ba] px-[1rem] py-[0.5rem] rounded-[0.5rem] font-bold mr-[0.5rem] min-w-[8rem]"
                                onClick={() => { openTickets(false) }}
                            >
                                Close
                            </button>
                        </div> */}
                    </div>
                </div>
            }
            {isBuyModal &&
                <div className="fixed w-[100vw] h-[100vh] top-0 left-0 flex justify-center items-center backdrop-blur-md z-50"
                    onClick={() => { openBuyModal(false) }}
                >
                    <div className="bg-[#282828a0] rounded-[1rem] flex flex-col p-[1rem] border-[5px] border-[#ffffff60] min-w-[25rem]"
                        onClick={(e) => { e.stopPropagation() }}
                    >
                        <div className="flex justify-between items-center text-white mb-[0.5rem] border-b-[1px] border-b-[gray]">
                            <p className="text-[1.5rem]"> Buy Tickets </p>
                            <button className="">
                                <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                            </button>
                        </div>
                        <p className="mt-[1rem] text-white text-[0.75rem]">
                            Your LOTTERY Balance:
                            <span className="font-bold text-[1rem]" style={{ color: balance >= ticketCount ? "#20ff20" : "#ff0000" }}> {balance} </span> $LTR
                        </p>
                        <div className="flex justify-between mb-[0.5rem]">
                            <p className="text-white text-[0.75rem]">
                                Ticket Price: 
                                <span className="font-bold text-[1rem] ml-[0.5rem]" style={{ color: balance >= ticketCount ? "#20ff20" : "#ff0000" }}> 
                                    { parseFloat(Web3.utils.fromWei(ticketPrice)).toFixed(2)} 
                                </span> $LTR
                            </p>
                            <p className="text-[.875rem] mr-[0.5rem] text-[#a0a0a0]"> Lottery Price: <span className="text-[1rem] font-bold text-[#e0e0e0]">{lotteryPrice}</span> <span className="text-[0.75rem] text-[#a0a0a0]">$USDT</span> </p>
                        </div>
                        <div className="flex items-center text-white border-b-[1px] border-b-[gray] pb-[1rem]">
                            <p className="font-bold text-white"> Ticket Count </p>
                            <div className="grow" />
                            <button className="flex justify-center items-center rounded h-[2.5rem] min-w-[2.5rem]"
                                onClick={() => { setTicketCount(ticketCount > 1 ? ticketCount - 1 : 1) }}>
                                <FontAwesomeSvgIcon icon={faMinus} width={24} height={24} />
                            </button>
                            <p className="bg-transparent border-[2px] border-[#ffffff30] rounded-[0.5rem] min-w-[3rem] text-center text-[1.5rem]"> {ticketCount} </p>
                            <button className="flex justify-center items-center rounded h-[2.5rem] min-w-[2.5rem]"
                                onClick={() => { setTicketCount(ticketCount < 6 ? ticketCount + 1 : 6) }}>
                                <FontAwesomeSvgIcon icon={faPlus} width={24} height={24} />
                            </button>
                        </div>

                        <div className="flex justify-end items-center pt-[0.75rem]">
                            {!isApproved &&
                                <button className="bg-[#ffd50f] text-black px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem] mr-[.5rem]"
                                    onClick={onApproveClicked}>
                                    Approve
                                </button>
                            }

                            {isApproved &&
                                <button className="bg-primary px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem] text-white" disabled={balance < ticketCount}
                                    onClick={buyToken}
                                > BUY </button>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
        </div>
    )
}
import { useRef } from "react";
import { faAngleLeft, faAngleRight, faArrowRight, faClose } from "@fortawesome/free-solid-svg-icons";
import CLIENT_API from "api";
import LotteryCard from "components/LotteryCard"
import { useEffect, useState } from "react"
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon";
import { useDispatch } from "react-redux";
import { useUtil } from "store/hook";
import { setRoundList, showOverlay, hideOverlay } from "store/slices/utilSlice";
import { useAccount } from "wagmi";
import Image from "next/image";
import Web3 from "web3";
import { toast } from "react-toastify";

import { LOTTERY_ADDRESS, LOTTERY_TOKEN, RPCURL } from "config/address";
import { LOTTERY_ABI } from "config/abi";

export default function History() {
    const dispatch = useDispatch();
    const { isConnected, address } = useAccount();
    const { roundList, ticketPrice } = useUtil();
    const [pendingList, setPendingList] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [isPendingTicketModal, openPendingTickets] = useState(false);
    const ticket = useRef(null);
    const [lastRoundId, setLastRoundId] = useState(1);
    const [lastRoundValue, setLastRoundValue] = useState(111111);

    const [balance, setBalance] = useState(0);
    const [allowance, setAllowanceAmount] = useState(0);
    const [isApproved, setApproved] = useState(false);

    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        if (address) {
            checkApproved();
        }
    }, [address])

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        load();
    }, [address])

    const load = async () => {
        const res = await CLIENT_API.getRounds(isConnected ? address : "");
        setPendingList(res?.pending? res.pending : []);
        setLastRoundId(res.pendingRoundId);
        setLastRoundValue(res.pendingRoundValue);

        if (res.data?.length == 0) {
            dispatch(setRoundList({
                roundList: [{
                    id: 1,
                    value: "0000000",
                    totalPrize: "0",
                    isStarted: false,
                    status: 0,
                }]
            }))
        } else {
            const f = res.data.filter((item) => item.status < 3).length;
            if (f > 0)
                dispatch(setRoundList({ roundList: [...res.data.map((item) => { return { ...item, isStarted: true } })] }));
            else
                dispatch(setRoundList({
                    roundList: [{
                        id: res.data.length + 1,
                        value: "0000000",
                        totalPrize: "0",
                        isStarted: false,
                        status: 0,
                        BuyRequests: [],
                    }, ...res.data.map((item) => { return { ...item, isStarted: true } })]
                }));

        }
    }

    const onMoveRounds = (d) => {
        if ((pageIndex + d < roundList.length - (width > 1536 ? 2 : width < 768 ? 0 : 1)) && (pageIndex + d >= 0)) {
            setPageIndex(pageIndex + d);
        }
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
        if (allowance < pendingList.length) {
            await setAllowance();
        }
    }

    async function setAllowance() {
        dispatch(showOverlay("Running"));

        try {
            const web3 = new Web3(Web3.givenProvider);
            const tokenContract = new web3.eth.Contract(BEP20_ABI, LOTTERY_TOKEN);

            const am = Web3.utils.toBN(ticketPrice).mul(Web3.utils.toBN(pendingList.length)).toString();
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
            console.log("Approve failed", e);
        }
        dispatch(hideOverlay());
        toast.error("Transaction Failed.")
    }

    async function buyToken(amount) {
        dispatch(showOverlay("Running"));
        try {
            const web3 = new Web3(Web3.givenProvider);
            const lotteryContract = new web3.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const { success, gas, message } = await estimateGas(lotteryContract, "buy", 0, [LOTTERY_TOKEN, pendingList.map((item) => item.value)]);

            if (!success) {
                const m = decodeError(message);
                toast.error("Transaction Failed" + m);
                return;
            }

            const args = [LOTTERY_TOKEN, pendingList.map((item) => item.value)];
            const res = await runSmartContract(lotteryContract, "buy", 0, args)
            toast.success("Successfully purchased");
            checkApproved();
            dispatch(hideOverlay());
            openBuyModal(false);
            setPendingList([]);
            return;
        } catch (e) {
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
            const b = Web3.utils.toBN(ticketPrice).mul(Web3.utils.toBN(pendingList.length));
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
        <div className="flex flex-wrap justify-center bg-primary w-screen pb-[50px]">
            <h2 className="text-[3rem] m-[3rem] text-white w-full text-center">
                Lottery Results
            </h2>

            <div className="flex flex-col justify-start 2xl:min-w-[1600px] xl:min-w-[1320] lg:min-w-[1260] md:min-w-[800px] xl:max-w-[1320] lg:max-w-[1260] md:max-w-[800px] overflow-hidden mx-[50px]">
                <div className="w-full flex items-center px-[2rem]">
                    {/* <button className="bg-primary text-white text-[1rem] px-[1rem] py-[0.5rem] bg-[#1f244740] mr-[0.5rem]">
                        All History
                    </button>
                    <button className="bg-primary text-white text-[1rem] px-[1rem] py-[0.5rem] bg-[#1f244740] mr-[0.5rem]">
                        Your History
                    </button> */}
                    {pendingList.length > 0 &&
                        <button onClick={() => { load(); openPendingTickets(true) }}>
                            <p className="text-black bg-[#ffff20] px-[1rem] rounded-[0.5rem]"> You have <span className="font-bold text-[1.25rem] text-white rounded-full bg-[#ff5050] w-[2rem] text-center px-[0.5rem]">{pendingList.length}</span> pendingTickets</p>
                        </button>
                    }
                    <div className="grow"></div>
                    {pageIndex > 0 &&
                        <button className="px-[1rem] h-[2.5rem] bg-[#00ff00] mr-[0.5rem] rounded-full flex justify-center items-center hover:shadow text-   black hover:font-bold"
                            onClick={() => { onMoveRounds(-pageIndex) }}
                        >
                            <FontAwesomeSvgIcon icon={faAngleLeft} width={16} height={16} />
                            <FontAwesomeSvgIcon icon={faAngleLeft} width={16} height={16} className="-ml-[.5rem]" />
                            Current Round
                        </button>
                    }
                    { roundList.length > (width > 1536 ? 3 : width < 768 ? 1 : 2) && 
                        <>
                            <button className="w-[2.5rem] h-[2.5rem] bg-[#00000040] mr-[0.5rem] rounded-full flex justify-center items-center hover:shadow text-[#a0a0a0] hover:text-white"
                                onClick={() => { onMoveRounds(-1) }}
                            >
                                <FontAwesomeSvgIcon icon={faAngleLeft} width={24} height={24} />
                            </button>
                            <button className="w-[2.5rem] h-[2.5rem] bg-[#00000040] mr-[0.5rem] rounded-full flex justify-center items-center hover:shadow text-[#a0a0a0] hover:text-white"
                                onClick={() => { onMoveRounds(1) }}
                            >
                                <FontAwesomeSvgIcon icon={faAngleRight} width={24} height={24} />
                            </button>
                        </>
                    }
                    
                </div>
                <div className="flex w-full transition-all duration-500" style={{ justifyContent: roundList.length <= (width > 1536 ? 3 : width < 768 ? 1 : 2) ? "center": "start",  marginLeft: `-${pageIndex * (width > 1536 ? 33.33 : width > 768 ? 50 : 100)}%` }}>
                    {roundList.map((item, index) =>
                        <LotteryCard ref={ticket} key={index} data={{ ...item }} isOpen={false} hasPending={pendingList.length>0}/>
                    )}
                </div>

            </div>
            {isPendingTicketModal &&
                <div className="fixed w-[100vw] h-[100vh] top-0 left-0 flex justify-center items-center backdrop-blur-md z-50"
                    onClick={() => { openPendingTickets(false) }}
                >
                    <div className="bg-[#282828a0] rounded-[1rem] flex flex-col p-[1rem] border-[5px] border-[#ffffff60]">
                        <div className="flex justify-between items-center text-white mb-[0.5rem]">
                            <p className="text-[1.25rem]"> <span className="font-bold text-[2rem]">{pendingList.length}</span> Tickets Pending <span className="text-[1rem] text-[#808080]">(Round {lastRoundId})</span> </p>
                            <button className="">
                                <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                            </button>
                        </div>
                        <div className="flex space-[0.5rem] mt-[0.75rem] items-center border-b-[2px] border-[#707070] pb-[0.5rem] mb-[1rem]">
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[0]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[1]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[2]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[3]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[4]}.png`} />
                            <Image alt="" width={50} height={50} src={`/images/digits/0${String(lastRoundValue)[5]}.png`} />
                            <div className="grow"></div>
                        </div>
                        {pendingList?.length == 0 &&
                            <p className="text-[#a7a9ba]"> You have no ticket for this round </p>
                        }
                        <div className="flex flex-col max-h-[320px] overflow-y-auto scrollbar">
                            {pendingList.map((ticket, index) =>
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
                        <div className="flex justify-end items-center pt-[0.75rem]">
                            {!isApproved &&
                                <button className="bg-[#ffd50f] text-black px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem] mr-[.5rem]"
                                    onClick={onApproveClicked}>
                                    Approve
                                </button>
                            }

                            {isApproved &&
                                <button className="bg-primary px-[1rem] py-[0.25rem] rounded-[0.5rem] font-bold min-w-[8rem] text-white" disabled={balance < parseFloat(Web3.utils.fromWei(Web3.utils.toBN(ticketPrice).mul(Web3.utils.toBN(pendingList.length))))}
                                    onClick={buyToken}
                                > BUY </button>
                            }
                        </div>
                    </div>
                    
                </div>
            }
        </div>
    )

}
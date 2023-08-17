import Image from "next/image"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import CLIENT_API from "api"
import Web3 from "web3"
import Moment from "react-moment"
import { useUtil } from "store/hook";
import { hideOverlay, setRoundList, showOverlay } from "store/slices/utilSlice";
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon"
import { faEye, faTicket } from "@fortawesome/free-solid-svg-icons"
import RequestTable from "components/RequestTable"
import { useAccount } from 'wagmi';

export default function RoundTable({ roundId }) {
    const dispatch = useDispatch();
    const { isConnected, address } = useAccount();
    const [ roundList, setRoundList] = useState([]);
    const [ isRunning, setRunning ] = useState([]);
    const [ isRequestTable, setRequestTable] = useState(0);

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await CLIENT_API.getRounds(address);

        setRoundList([...res.data]);
        setRunning(false);

        res.data.map((round) => {
            if(round.status > 0 && round.status < 3) {
                setRunning(true);
            }
        })
    }

    const onCheck = async () => {
        // const txs = await UTILS_API.checkTransactions()
        // dispatch(setTransactions({ transactions: txs }))
    }


    const onCompleteRound = async (roundId) => {
        dispatch(showOverlay("Round Completed. Sending Rewards..."));

        const res = await CLIENT_API.completeRound(roundId);
        const f = res.filter((item) => item.status < 3).length;
        if (f > 0)
            setRoundList([...res]);
        else
            setRoundList([...res]);

        setRunning(false);

        res.map((round) => {
            if(round.status > 0 && round.status < 3) {
                setRunning(true);
            }
        })
        dispatch(hideOverlay());
    }

    const onStartRound = async () => {
        let roundId = 1;
        if(roundList.length > 0) roundId = roundList[0].id + 1;
        dispatch(showOverlay(`Starting Round ${roundId}`));
        const res = await CLIENT_API.startRound(roundId);
        setRoundList([...res]);
        setRunning(false);

        res.map((round) => {
            if(round.status > 0 && round.status < 3) {
                setRunning(true);
            }
        })
        dispatch(hideOverlay());
    }

    return (
        <div className="w-full mt-0 mb-[20px] w-[calc(100%-100px)] flex flex-col bg-[#20182C] md:p-[50px] p-[20px] rounded-[16px]">
            <div className="flex items-center mb-[20px]">
                <p className="text-[1.5rem] text-[white]"> Total Rounds </p>
                <div className="grow"></div>
                { !isRunning &&
                    <button className="bg-[#10e010] hover:bg-[#30ff30] h-[40px] rounded-full px-[40px] text-black transition-all duration-150 mr-[0.5rem]"
                    onClick={onStartRound}
                > New Round </button>
                }
                
                <button className="bg-[#282454] hover:bg-[#6639E4] opacity-100 hover:opacity-80 h-[40px] rounded-full px-[40px] text-[white] transition-all duration-150"
                    onClick={() => { load() }}
                > Refresh </button>
            </div>
            <div>
                <table className="w-full">
                    <thead>
                        <tr className="flex w-full text-white h-[40px]">
                            <td className="w-[50px] text-center"> No </td>
                            <td className="w-[210px]"> Value </td>
                            <td className="w-[120px]"> TotalPrize </td>
                            <td className="w-[200px]"> From </td>
                            <td className="w-[200px]"> To </td>
                            <td className="w-[120px]"> Status </td>
                            <td className="grow"> Actions </td>
                        </tr>
                    </thead>

                    <tbody>
                        {roundList.map((round, index) =>
                            <tr key={round.id} className="text-white flex hover:bg-[#ffffff30] text-[12px]">
                                <td className="w-[50px] text-center">
                                    {round.id}
                                </td>
                                <td className="w-[210px] overflow-hidden">
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[0]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[1]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[2]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[3]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[4]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(round.value)[5]}.png`} />
                                </td>
                                <td className="w-[120px]">
                                    <span className="font-bold text-[1rem]">{parseFloat(Web3.utils.fromWei(round.totalPrize)).toFixed(3)}</span> <span className="">$LTR</span>
                                </td>
                                <td className="w-[200px]">
                                    <Moment date={new Date(1000 * round.startAt)} format="ddd, MMM D, yyyy hh:mm" />
                                </td>
                                <td className="w-[200px]">
                                    <Moment date={new Date(1000 * round.endAt)} format="ddd, MMM D, yyyy hh:mm" />
                                </td>
                                <td className="w-[120px]">
                                    <div className="flex items-center">

                                        {round.status > 0 && round.status < 3 &&
                                            <p className="px-[0.5rem] py-[.25rem] bg-[#30ff30] text-[0.75rem] leading-[1rem] text-black rounded-full"> Running Now </p>
                                        }
                                        {round.status == 3 &&
                                            <p className="px-[0.5rem] py-[.25rem] bg-[#3030ff] text-[0.75rem] leading-[1rem] text-white rounded-full"> Finished </p>
                                        }
                                    </div>
                                </td>
                                <td className="grow">
                                    <div className="flex">
                                        { isConnected && round.status < 3 && round.status > 0 &&
                                            <button className="bg-primary text-white px-[0.5rem] leading-[1.5rem] rounded-[0.5rem] shadow font-bold mr-[0.5rem]" onClick={() => {onCompleteRound(round.id)}}>
                                                Force Finish
                                            </button>
                                        }
                                        <button className="text-white px-[0.5rem] leading-[1.5rem] rounded-[0.5rem] shadow font-bold" onClick={() => {setRequestTable(round.id)}}>
                                            <FontAwesomeSvgIcon icon={faEye} width={24} height={24} color="#a0a0a0"/>
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            { isRequestTable > 0 && 
            <div className="fixed top-0 left-0 w-screen h-screen bg-[#30303030] backdrop-blur flex flex-col z-50">
                <RequestTable roundId={isRequestTable} onClose={() => {setRequestTable(0)}}/>
            </div>
            }
        </div>
    )
}
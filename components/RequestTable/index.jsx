import Image from "next/image"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon"
import { faCheck, faCheckCircle, faClose } from "@fortawesome/free-solid-svg-icons"
import { ClipLoader } from "react-spinners"
import CLIENT_API from "api"
import { setRoundList } from "store/slices/utilSlice";
import { useAccount } from 'wagmi';
import Web3 from "web3"
import Moment from "react-moment"

export default function RequestTable({ roundId, onClose }) {
    const [requestList, setListData] = useState([]);

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await CLIENT_API.getRequests(roundId);
        console.log("requestData",res);
        setListData(res)
    }
    
    return (
        <div className="relative m-[50px] w-[calc(100%-100px)] flex flex-col bg-[#20182C] md:p-[50px] p-[20px] rounded-[16px]">
            <button className="absolute right-[1rem] top-[1rem] w-[2rem] h-[2rem] rounded-full bg-[#303030] flex items-center justify-center" onClick={onClose}>
                <FontAwesomeSvgIcon icon={faClose} width={24} height={24} color="#a0a0a0"/>
            </button>
            <div className="flex items-center mb-[20px]">
                <p className="text-[1.5rem] text-[white]"> Total Requests <span className="text-[1rem] font-bold text-[#707070]"> Round - {roundId} </span></p>
                <div className="grow"></div>
                <button className="bg-[#282454] hover:bg-[#6639E4] opacity-100 hover:opacity-80 h-[40px] rounded-full px-[40px] text-[white] transition-all duration-150"
                    onClick={() => { load() }}
                > Refresh </button>
            </div>
            <div className="flex justify-between items-center mb-[20px]">
                
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <table className="w-full">
                    <thead>
                        <tr className="flex w-full text-white h-[40px]">
                            <td className="w-[50px] text-center"> No </td>
                            <td className="w-[120px]"> Wallet </td>
                            <td className="w-[210px]"> Value </td>
                            <td className="w-[120px]"> Score </td>
                            <td className="w-[120px]"> Reward </td>
                            <td className="w-[120px]"> Coin </td>
                            <td className="w-[150px]"> Status </td>
                            <td className="w-[100px]"> Created At </td>
                        </tr>
                    </thead>

                    <tbody>
                        {requestList.map((request, index) =>
                            <tr key={request.id} className="text-white flex leading-[1.75rem] hover:bg-[#ffffff30] text-[12px]">
                                <td className="w-[50px] text-center">
                                    {request.id}
                                </td>
                                <td className="w-[120px] overflow-hidden">
                                    {String(request.wallet).substring(0,6)}...{String(request.wallet).substring(request.wallet.length-3)}
                                </td>
                                <td className="w-[210px]">
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[0]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[1]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[2]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[3]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[4]}.png`} />
                                    <Image alt="" width={32} height={32} src={`/images/digits/0${String(request.value)[5]}.png`} />
                                </td>
                                <td className="w-[120px]">
                                    {request.score > 0 &&
                                    <div className="flex items-center">
                                        <FontAwesomeSvgIcon icon={faCheckCircle} width={16} height={16} color="#30ff30" />
                                        <p className=" ml-[0.5rem] text-[0.75rem] leading-[1rem] rounded-full font-bold"> {request.score} </p>
                                    </div>
                                    }
                                    {request.score == 0 &&
                                    <div className="flex items-center">
                                        <FontAwesomeSvgIcon icon={faClose} width={16} height={16} color="#ff0000" />
                                        <p className=" ml-[0.5rem] text-[0.75rem] leading-[1rem] rounded-full"> {request.score} </p>
                                    </div>
                                    }
                                    
                                </td>
                                <td className="w-[120px]">
                                    {Web3.utils.fromWei(request.reward)}
                                </td>
                                <td className="w-[120px]">
                                    {String(request.paymentCoin).substring(0,6)}...{String(request.paymentCoin).substring(request.paymentCoin.length-3)}
                                </td>
                                <td className="w-[150px]">
                                    <div className="flex items-center">

                                    {request.status == 0 &&
                                        <p className="px-[0.5rem] py-[.25rem] bg-[#30ff30] text-[0.75rem] leading-[1rem] text-black rounded-full"> Completed </p>
                                    }
                                    {request.status == 1 &&
                                        <p className="px-[0.5rem] py-[.25rem] bg-[#3030ff] leading-[1.25rem] rounded-full"> Pending </p>
                                    }
                                    </div>
                                </td>
                                <td>
                                    <Moment date={request.createdAt} format="ddd, MMM D, yyyy hh:mm"/>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="w-full">
                    {requestList.length == 0 && 
                        <p className="text-center text-[#a0a0a0]"> No Requests </p>
                    }
                </div>
            </div>
        </div>
    )
}
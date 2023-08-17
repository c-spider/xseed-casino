import { useCallback, useState, useEffect } from "react";
import Web3 from "web3";

import Image from "next/image";
import { useUtil } from "store/hook";

export default function CountDown() {
    const { roundId, ticketPrice, totalPrize, endTime, lotteryPrice, ticketCount } = useUtil();
    const [ duration, setDuration ] = useState({days: 0, hours: 0, minutes: 0})

    const calcDuration = () => {
        let currentDate = new Date();
        let endDate = new Date(endTime);
        let diff = endDate - currentDate;

        if (diff < 0) {
            return "endTime is in the past";
        }
    
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);
    
        let hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
    
        let minutes = Math.floor(diff / (1000 * 60));
        setDuration({days, hours, minutes});

    };

    useEffect(() => {
        calcDuration();

        const intervalId = setInterval(() => {
            calcDuration();
        }, 10000)

        return () => clearInterval(intervalId);
    }, [endTime])

    

    return (
        <div className="flex flex-col bg-[#131428] pb-[5rem]">
            <div className="w-full flex justify-center mt-[2rem]">
                <div className="max-w-[50%] min-w-[240px]">
                    <Image alt="" src="/images/count_title.png" width={2273} height={236} />
                </div>
            </div>
            <div className="w-full flex justify-center mt-[3rem]">
                <button className="w-[20rem] px-[1rem] hover:px-[0rem] pt-[0rem] hover:pt-[0.2rem] transition-all duration-300">
                    <Image alt="" src="/images/buybtn.png" width={1315} height={417} />
                </button>
            </div>
            <div className="flex mt-[3rem] justify-center font-bold text-[2rem] text-white">
                <div className="w-[10rem] md:w-[15rem] mx-[1rem] h-[7rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> {duration?.days} </p>
                    <p> DAYS </p>
                </div>
                <div className="w-[10rem] md:w-[15rem] mx-[1rem] h-[7rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> {duration?.hours} </p>
                    <p> Hours </p>
                </div>
                <div className="w-[10rem] md:w-[15rem] mx-[1rem] h-[7rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> {duration?.minutes} </p>
                    <p> Mins </p>
                </div>
            </div>
            <div className="flex mt-[3rem] justify-center font-bold text-[1rem] text-white">
                <div className="w-1/2 h-fit p-[1rem] border-[5px] rounded-[1rem] border-primary flex justify-center items-center">
                    <div className="flex flex-col items-end">
                        <p> Lottery Round: </p>
                        <p> Ticket Price: </p>
                        <p> Lottery<span className="text-[#a0a0a0] text-[0.75rem]">($LTR)</span> Price: </p>
                        <p> Ticket count: </p>
                    </div>
                    <div className="flex flex-col pl-[0.25rem]">
                        <p> { roundId }</p>
                        <p> { parseFloat(Web3.utils.fromWei(ticketPrice)).toFixed(2)} <span className="text-[#a0a0a0] text-[0.75rem]">$LTR</span> </p>
                        <p> { lotteryPrice } <span className="text-[#a0a0a0] text-[0.75rem]">$USDT</span></p>
                        <p> { ticketCount } </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
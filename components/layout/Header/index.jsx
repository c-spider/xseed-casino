import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useUtil } from 'store/hook';

import { useWeb3Modal } from '@web3modal/react'
import { useAccount } from 'wagmi';
import Web3 from 'web3';

import { LOTTERY_ADDRESS, LOTTERY_TOKEN, RPCURL } from "config/address";
import { LOTTERY_ABI } from "config/abi";
import { setLoaded, setRoundStatus } from 'store/slices/utilSlice';

export default function Header() {
    const dispatch = useDispatch();
    const { open } = useWeb3Modal();
    const { isConnected, address } = useAccount();
    const { endTime, isRunning, loaded } = useUtil();
    const [isReady, setReady] = useState(false);
    const [loadedTime, setLoadedTime] = useState(0);
    const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0 })

    const calcDuration = () => {
        let currentDate = new Date();
        let endDate = new Date(endTime);

        // Calculate the difference in milliseconds
        let diff = endDate - currentDate;

        if (diff < 0) {
            return "endTime is in the past";
        }

        // Convert difference to days, hours, and minutes
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        let hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        let minutes = Math.floor(diff / (1000 * 60));
        setDuration({ days, hours, minutes });

    };

    useEffect(() => {
        setReady(true)
        const t = new Date();
        setLoadedTime(parseInt(t.getTime() / 1000))
        load();
        
        const intervalId = setInterval(() => {
            load();
        }, 10000)

        return () => {
            clearInterval(intervalId)
        };
    }, [endTime])

    const load = async () => {
        await getRoundStatus();
        calcDuration();
        if(loaded == false) {
            setTimeout(() => {
                dispatch(setLoaded());
            }, 1500)
        }
    }

    const getRoundStatus = async () => {
        try {
            const web3_read = new Web3(RPCURL);
            const lotteryContract = new web3_read.eth.Contract(LOTTERY_ABI, LOTTERY_ADDRESS);

            const res = await callSmartContract(lotteryContract, "getRoundStatus", []);
            const _endTime = parseInt(res.roundData[7].toString()) * 1000;
            const lotteryPrice = await callSmartContract(lotteryContract, "getEstimatedUSD", [LOTTERY_TOKEN, '1000000000000000000']);

            dispatch(setRoundStatus({
                currentRound: JSON.parse(JSON.stringify(res)),
                roundId: res.roundData[0].toString(),
                ticketPrice: res.roundData[2].toString(),
                totalPrize: res.roundData[1].toString(),
                isRunning: res._isRunning,
                rewardRule: res.rewardPercentages.map((v) => parseInt(v) / 100.0),
                endTime: _endTime,
                lotteryPrice: parseFloat(Web3.utils.fromWei(lotteryPrice)).toFixed(3),
                ticketCount: res.roundData[6].toString(),
                rewardRule: res.rewardPercentages.map((v) => parseInt(v) / 100.0),
            }))

            return;
        } catch (e) {
        }
    }

    return (
        <div className='flex flex-col z-30 fixed w-full'>
            <div className={"bg-[#000000a0] backdrop-blur-md w-full top-0 flex justify-center py-[10px] drop-shadow-xl xl:px-[12rem] md:px-[5rem] px-[3rem]"}>
                <div className='grow flex justify-between items-center px-[24px]'>
                    <div className='w-full flex items-center justify-center md:justify-start'>
                        <div className='flex justify-center items-center transition-all duration-300'>
                            <Image
                                src='/images/xseed.png'
                                alt='ThinkingMind'
                                width={50}
                                height={50}
                            />
                            <h3 className='text-white text-[24px] ml-[10px] font-bold'> XSEED CASINO </h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex w-full justify-center">
                <div className="w-full h-[5rem] bg-[#e0e0e040] backdrop-blur-sm flex justify-between items-center xl:px-[12rem] md:px-[5rem] px-[3rem]">
                    <div className="text-white text-[1.5rem] whitespace-nowrap">
                        {(isRunning && endTime > loadedTime) &&
                            <p className='text-[#e0e0e0] text-[1rem]'> <span className='font-bold text-[1.25rem]'>Next Withdraw in</span> <span className='text-white font-bold text-[2rem]'> {duration.days}</span> Days <span className='text-white font-bold text-[2rem]'> {duration.hours}</span> Hours <span className='text-white font-bold text-[2rem]'> {duration.minutes}</span> Mins</p>
                        }
                    </div>
                    {isReady &&
                        <button className="px-[2rem] py-[0.75rem] text-[1rem] text-[#202040] font-bold border-[2px] border-[#404060] hover:border-white rounded bg-[#9090ff] shadow" 
                            onClick={open}> 
                            { isConnected ? `${address.substring(0,6)}...${address.substring(38)}` : "Connect Wallet "}
                        </button>
                    }
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
}
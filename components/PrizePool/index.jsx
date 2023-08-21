import Image from "next/image"
import { useUtil } from "store/hook"

export default  function PrizePool() {
    const { rewardRule } = useUtil();

    return (
        <div className="flex flex-col py-[50px] w-full lg:px-[12rem] px-[2rem]">
            <h2 className="font-bold text-center text-[3rem] text-white mb-[1rem]"> PRIZEPOOl </h2>
            <div className="flex flex-col rounded border-[2px] border-[#ffffff20] bg-[#402040a0] p-[2rem] shadow w-full">
                <div className="flex">
                    <div className="w-1/2 relative flex justify-center px-[50px] hidden lg:block">
                        <Image alt="" src="/images/token.png" width={300} height={300}/>
                    </div>
                    <div className="flex grow justify-between items-center text-[1.25rem] text-[#e0e0e0] font-bold">
                        <div className="flex flex-col">
                            <p className="font-bold text-[1.5rem] mb-[1rem]"> Digits Matched </p>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>First 1</p> </div>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>First 2</p> </div>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>First 3</p> </div>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>First 4</p> </div>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>First 5</p> </div>
                            <div className="flex items-center mb-[0.5rem]"> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full mr-[0.5rem]"></div> <p>All 6</p> </div>
                        </div>
                        <div className="flex flex-col items-end">
                        <p className="font-bold text-[1.5rem] mb-[1rem]"> Percent of Prize Won </p>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[1]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[2]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[3]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[4]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[5]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                            <div className="flex items-center mb-[0.5rem]">  <p>{rewardRule[6]}%</p> <div className="min-w-[16px] min-h-[16px] bg-[#2030ff] rounded-full ml-[0.5rem]"></div> </div>
                        </div>
                    </div> 
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-between items-center py-[1rem] my-[2rem] border-y-[1px] border-[#a0a0a0] text-white">
                    <h3 className="font-bold text-center text-[2rem]"> PRIZEPOOl </h3>
                    <p>Prize money comes from three sources:</p>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="grow flex flex-col justify-center items-center text-white px-[1rem]">
                        <h6 className="font-bold text-[1.5rem] mb-[0.5rem]"> SALES </h6>
                        <p className="text-[#a0a0a0] mb-[2rem]"> {100-rewardRule[0]-rewardRule[7]}% of funds used to buy tickets goes directly into the prize pools. {rewardRule[0]}% is allocated to treasury for platform development, and {rewardRule[7]}% is burned.</p>
                    </div>
                    <div className="grow flex flex-col justify-center items-center text-white px-[1rem]">
                        <h6 className="font-bold text-[1.5rem] mb-[0.5rem]"> ROLLOVER </h6>
                        <p className="text-[#a0a0a0] mb-[2rem]"> After every round, if nobody wins in one of the prize brackets, the unclaimed USDT for that bracket rolls over into the next round and is redistributed among the prize pools.After every round, if nobody wins in one of the prize brackets, the unclaimed USDT for that bracket rolls over into the next round and is redistributed among the prize pools.</p>
                    </div>
                    <div className="grow flex flex-col justify-center items-center text-white px-[1rem]">
                        <h6 className="font-bold text-[1.5rem] mb-[0.5rem]"> INJECTIONS </h6>
                        <p className="text-[#a0a0a0] mb-[2rem]"> Additional rewards may be added to the prize pool for the next draw after each round and will be distributed among the prize pools.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
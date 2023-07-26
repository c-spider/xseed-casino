import Image from "next/image";

export default function CountDown() {
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
                    <p> 1 </p>
                    <p> DAYS </p>
                </div>
                <div className="w-[10rem] md:w-[15rem] mx-[1rem] h-[7rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> 1 </p>
                    <p> Hours </p>
                </div>
                <div className="w-[10rem] md:w-[15rem] mx-[1rem] h-[7rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> 1 </p>
                    <p> Mins </p>
                </div>
            </div>
            <div className="flex mt-[3rem] justify-center font-bold text-[1rem] text-white">
                <div className="w-1/2 h-fit p-[1rem] border-[5px] rounded-[1rem] border-primary flex flex-col justify-center items-center">
                    <p> Lottery Number : 12 </p>
                    <p> Current Price Amount: $123435 </p>
                    <p> Current Number of Entries: 135 </p>
                    <p> Your ticket count: 5 </p>
                </div>
            </div>
        </div>
    )
}
import LotteryCard from "components/LotteryCard"

export default function History({ data }) {
    return (
        <div className="flex flex-wrap justify-center bg-primary">
            <h2 className="text-[3rem] m-[3rem] text-white w-full text-center">
                Lottery Results 
            </h2>
            <div className="w-full flex items-center">
                <button className="bg-primary text-white text-[1rem] px-[1rem] py-[0.5rem] bg-[#1f244740] mr-[0.5rem]"> 
                    All History
                </button>
                <button className="bg-primary text-white text-[1rem] px-[1rem] py-[0.5rem] bg-[#1f244740] mr-[0.5rem]"> 
                    Your History
                </button>
                <div className="grow"></div>
                <button className="bg-primary text-white text-[1rem] w-[2rem] h-[2rem] bg-[#1f244740] mr-[0.5rem] rounded-full"> 
                    {"<<"}
                </button>
                <button className="bg-primary text-white text-[1rem] w-[2rem] h-[2rem] bg-[#1f244740] mr-[0.5rem] rounded-full"> 
                    {">"}
                </button>
                <button className="bg-primary text-white text-[1rem] w-[2rem] h-[2rem] bg-[#1f244740] mr-[0.5rem] rounded-full"> 
                    {"<"}
                </button>
                <button className="bg-primary text-white text-[1rem] w-[2rem] h-[2rem] bg-[#1f244740] mr-[0.5rem] rounded-full"> 
                    {">>"}
                </button>
            </div>
            { data.map((item) => 
                <LotteryCard data={{ number: '135769', myTickets: ["135769", "659652", "385741"], prize: 12354}} isOpen={false}/>
            )}
        </div>
    )
}
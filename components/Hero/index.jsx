import { useState, useReact } from "react"
import Image from "next/image"
import LotteryCard from "components/LotteryCard"

export default function Hero() {
    return (
        <div className="w-full flex relative overflow-hidden min-h-[100vh] h-fit bg-[url('/images/heroback.png')]">
            {/* <div className="top-0 left-0 w-[100vw] min-h-[100vh] overflow-hidden object-cover">
                <Image alt="" src="/images/heroback.png" width={1920} height={800} layout="fill" />
            </div> */}
            <div className="top-0 left-0 w-full h-fit flex flex-col">
                <div className="flex w-full justify-center mt-[10rem] xl:px-[15rem]">
                    <div className="max-w-[400px] xl:max-w-[500px]">
                        <Image src="/images/herologo.png" alt="" width={1275} height={1096} />
                    </div>
                </div>

                <div className="flex w-full justify-center mt-[2rem]">
                    <div className=" max-w-[30%]">
                        <Image src="/images/2.png" alt="" width={1275} height={1096} />
                    </div>
                    <div className=" max-w-[30%]">
                        <Image src="/images/3.png" alt="" width={1275} height={1096} />
                    </div>
                    <div className=" max-w-[30%]">
                        <Image src="/images/4.png" alt="" width={1275} height={1096} />
                    </div>
                </div>
                {/* <div className="w-1/2 flex flex-col relative mt-[150px] z-10">
                    <div className="mb-[3rem] lg:ml-[5rem] ml-[1rem]">
                    </div>
                    <div className="w-full flex justify-end">
                        <LotteryCard data={{ number: '135769', myTickets: ["135769", "659652", "385741"], prize: 12354}} isOpen={true}/>
                    </div>
                </div>
                <div className=" w-1/2 flex justify-center p-[50px]">
                    <div className="pt-[10rem] mx-[3rem] mix-blend-lighten min-w-[400px]">
                        <Image alt="" width={996} height={500} src="/images/casino.png"/>
                    </div>
                </div> */}
            </div>
            
        </div>
    )
}
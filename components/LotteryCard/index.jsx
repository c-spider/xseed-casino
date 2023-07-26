import Image from "next/image"
import { FontAwesomeSvgIcon } from "react-fontawesome-svg-icon"
import { faAngleDown, faAngleUp, faClose } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export default function LotteryCard ({ data, isOpen }) {
    const [isDetails, openDetails] = useState(isOpen);
    const [isTickets, openTickets] = useState(false);

    return (
        <div className="bg-[#282828a0] rounded-[1rem] m-[1rem] xl:w-[700px] lg:min-w-[600px] min-w-[400px] flex flex-col p-[2rem] border-[5px] border-[#ffffff60] h-fit transition-all duration-300">
            <div className="flex justify-between">
               <p className="text-white text-[2rem] font-medium">Winning Number</p> 
               <div className="flex flex-col items-end text-right text-white">
                    <p className="text-[1.25rem] font-bold"> 14 </p>
                    <p> Round No.</p>
                </div>
            </div>
            <div className="flex space-[0.5rem] mt-[0.75rem] items-center"> 
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[0]}.png`}/>
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[1]}.png`}/>
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[2]}.png`}/>
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[3]}.png`}/>
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[4]}.png`}/>
                <Image alt="" width={50} height={50} src={`/images/digits/0${data.number[5]}.png`}/>
                <div className="grow"></div>
                <p className="text-white text-[1.25rem]"> 100 $XSEED </p>
            </div>

            <div className="flex flex-col text-white text-[1rem] leading-[2rem] mt-[2rem]">
                <div className="flex items-center">
                    <p className="grow text-[#a7a9ba]"> Draw Date: </p>
                    <p className="grow text-right"> Date: <span>2023/12/15 12:00</span></p>
                </div>
                <div className="flex items-center">
                    <p className="grow text-[#a7a9ba]"> Tickets: </p>
                    <p className="grow text-right"> You have <span>{data.myTickets?.length}</span> tickets this round.</p>
                </div>
                { data.myTickets?.length > 0 && 
                    <div className="flex justify-end">
                        <button className="font-medium text-[#48efc7]"
                            onClick={() => {openTickets(true)}}
                        > View Tickets </button>
                    </div>
                }
            </div>

            <div className="border-[gray] border-t-[1px] mt-[1.5rem] pt-[1.5rem] text-white">
                <p className="6 Digits"> Prize Pot: <span className="font-bold">{data.prize} $XSEED</span> </p>
                <p className="grow">  </p>
                <p className="grow">Match the winning number in the same order to share prizes. </p>
            </div>
            { isDetails && 
                <div className="flex flex-col mt-[0.75rem]">
                    <div className="flex flex-col">
                        <p className="text-[1.25rem] font-medium text-white"> Total Players: <span className="font-bold"> 14 </span> </p>
                        <p className="text-[1.125rem] font-medium text-white"> Match all 6 </p>
                        <div className="flex text-white">
                            <p className="grow"> 12345.30 $XSEED </p>
                            <p className="grow"> 0 $XSEED Each </p>
                            <p className="grow text-right"> 0 Winning tickets </p>
                        </div>
                    </div>
                </div>
            }
            <div className="flex text-white text-[1rem] leading-[2rem] mt-[1rem]">
                <div className="grow flex items-center justify-center">
                    <Image src="/images/xseed.png" alt="" width={80} height={80} />
                </div>
                <div className="flex items-start">
                    <button className="flex items-center font-medium" onClick={() => { openDetails(!isDetails)}}>
                        <p className="mr-[0.25rem]">Details</p>
                        <FontAwesomeSvgIcon icon={isDetails ? faAngleUp : faAngleDown} width={16} height={16} />
                    </button>
                </div>
            </div>
            { isTickets &&
                <div className="fixed w-[100vw] h-[100vh] top-0 left-0 flex justify-center items-center backdrop-blur-md z-50"
                    onClick={() => {openTickets(false)}}
                >
                    <div className="bg-[#282828a0] rounded-[1rem] flex flex-col p-[1rem] border-[5px] border-[#ffffff60]">
                        <div className="flex justify-between items-center text-white mb-[0.5rem]">
                            <p className="text-[1.5rem]"> Round 13 </p>
                            <button className="">
                                <FontAwesomeSvgIcon icon={faClose} width={16} height={16} />
                            </button>
                        </div>
                        { data.myTickets?.length == 0 && 
                            <p className="text-[#a7a9ba]"> You have no ticket for this round </p>
                        }
                        {data.myTickets.map((ticket, index) =>
                            <div key={index} className="flex mt-[0.5rem]">
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[0]}.png`}/>
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[1]}.png`}/>
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[2]}.png`}/>
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[3]}.png`}/>
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[4]}.png`}/>
                                <Image alt="" width={50} height={50} src={`/images/digits/0${ticket[5]}.png`}/>
                                <div className="min-w-[10rem]"/>
                                <p className="text-white"> Match all 6 </p>
                            </div>
                        )}
                        <div className="border-t-[1px] border-[#a7a9ba] mt-[0.5rem] flex justify-end py-[0.5rem]">
                            <button className="bg-[#a7a9ba] px-[1rem] py-[0.5rem] rounded-[0.5rem] font-bold mr-[0.5rem] min-w-[8rem]"
                                onClick={() => {openTickets(false)}}
                            >
                                Close
                            </button>
                            <button className="bg-[#ffd50f] px-[1rem] py-[0.5rem] rounded-[0.5rem] font-bold min-w-[8rem]">
                                Buy Tickets
                            </button>
                        </div>
                    </div>
                </div>
            }
            
        </div>
    )
}
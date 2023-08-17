import Header from "../Header";

import { BarLoader, ClipLoader } from 'react-spinners'
import { useUtil } from "store/hook";
import Hero from "components/Hero";
import History from "components/History";
import CountDown from "components/CountDown";

export default function Layout({ children }) {
    const { isOverlay, isSpinner, comment, loaded } = useUtil();

    return (
        <div>
            <Header />
            <div className="bg-[#2a2a2a] w-full min-h-[calc(100vh-100px)] flex flex-col items-center overflow-hidden">
                {/* <ERC20Bridge /> */}
                {/* <Auth /> */}
                {/* <Factory /> */}
                {/* <Scale /> */}
                { children }
            </div>
            {/* <Footer /> */}
            {isSpinner &&
                <div className='z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <ClipLoader speedMultiplier={0.5} color='blue' size={50} />
                </div>
            }
            {isOverlay &&
                <div className='z-100 fixed w-screen h-screen top-0 left-0 bg-[#00000070] flex flex-col justify-center items-center'>
                    <div className="flex flex-col justify-center items-center p-[2rem] rounded-[1rem] border-[3px] border-[#ffffff80] backdrop-blur-sm bg-[#00000030]">
                        <p className="text-white mb-[0.5rem]"> {comment} </p>
                        <BarLoader speedMultiplier={0.5} color='white' size={50} width={200} />
                    </div>
                </div>
            }
            {!loaded &&
                <div className='z-100 fixed w-screen h-screen top-0 left-0 bg-[#000] flex flex-col justify-center items-center'>
                    <img src="/images/loading.gif"  width={200} height={200}/>
                    <p className="text-white text-[2rem] font-bold mt-[1rem]"> Loading MetaXSeed </p>
                </div>
            }
        </div>
    )
}
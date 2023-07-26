import Header from "../Header";

import { ClipLoader } from 'react-spinners'
import { useUtil } from "store/hook";
import Hero from "components/Hero";
import History from "components/History";
import CountDown from "components/CountDown";

export default function Layout({ children }) {
    const { isOverlay, isSpinner } = useUtil();

    return (
        <div>
            <Header />
            <div className="bg-[#2a2a2a] w-full min-h-[calc(100vh-100px)] flex flex-col items-center overflow-hidden">
                {/* <ERC20Bridge /> */}
                {/* <Auth /> */}
                <Hero />
                <CountDown />
                <History data={[1,2]}/>
                {/* <Factory /> */}
                {/* <Scale /> */}
            </div>
            {/* <Footer /> */}
            { isSpinner &&
                <div className='z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <ClipLoader speedMultiplier={0.5} color='blue' size={50}/>
                </div>
            }
            { isOverlay &&
                <div className='z-100 fixed w-screen h-screen top-0 left-0 bg-[#00000070]'>
                </div>
            }
        </div>
    )
}
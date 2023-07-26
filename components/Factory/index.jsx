import ERC20 from "components/ERC20"
import ERC721 from "components/ERC721"
import { useState } from "react"
import Tabs from "./Tabs"

const TABS=[
    "ERC20", "ERC721", "ERC1155"
]

export default function Factory() {
    const [selectedTab, selectTab] = useState(0)

    return (
        <div className="w-full px-[50px] relative">
            <div className="z-[10px] -mt-[30px]">
                <Tabs selectTab={selectTab} selected={selectedTab} tabs={TABS}/>
                <div className="min-h-[300px] bg-[#010044]">
                    { selectedTab === 0 && <ERC20 /> }
                    { selectedTab === 1 && <ERC721 /> }
                </div>
            </div>
        </div>
    )
}
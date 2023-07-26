import { useState } from "react"

export default function Tabs({ tabs, selected, selectTab}) {
    return (
        <div className="bg-[#cbfb45] h-[60px] flex items-center px-[20px]">
            {tabs.map((item, index) => 
                <button key={index} className="flex flex-col h-full"
                    onClick={() => {selectTab(index)}}
                >
                    <div className={(index == selected ? "text-white  bg-[#0078ff]" : "text-black") + " flex items-center grow px-[20px] py-[12px]"}>
                        { item }
                    </div>
                    <div  className={(index == selected ? "h-[4px]" : "h-[0px]") + " bg-[white] w-full"}></div>
                </button>
            )}
            <div className="w-grow"></div>
        </div>
    )
}
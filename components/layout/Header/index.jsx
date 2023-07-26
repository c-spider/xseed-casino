import WalletConnector from 'components/WalletConnector';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showWalletConnector } from 'store/slices/utilSlice';

import { useUtil } from 'store/hook';
import Navbar from './Navbar';
import SocialMediaRect from './SocialMediaRect';
import { FontAwesomeSvgIcon } from 'react-fontawesome-svg-icon';
import { faBars, faUser, faWallet } from '@fortawesome/free-solid-svg-icons'
import Button from './Button';
import SocialMedia from '../Footer/SocialMedia';

import { Web3Button } from '@web3modal/react'

export default function Header() {
    const dispatch = useDispatch();
    const { isWalletConnector } = useUtil();
    const [isDropDown, openDropdown] = useState(false);
    const [isShadow, showShadow] = useState(false);
    useEffect(() => {
        if (window) {
            window.onscroll = function () {
                checkScroll();
            }
        }
    }, [])

    const checkScroll = function () {
        if (window.pageYOffset > 30) {
            showShadow(true);
        } else {
            showShadow(false);
        }
    }

    return (
        <div className='flex flex-col z-30 fixed w-full'>
            <div className={"bg-[#000000a0] backdrop-blur-md w-full top-0 flex justify-center py-[10px] drop-shadow-xl"}>
                <div className='grow flex justify-between items-center px-[24px]'>
                    <div className='flex items-center'>
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
                    <Navbar className="hidden lg:block" />
                    <div className='flex justify-end items-center'>
                        <div className="h-[50px] flex items-center mr-[10px]">
                            <Web3Button />
                        </div>
                        {/* <div className="h-[50px] flex items-center">
                            <button className="flex justify-center items-center bg-[#282454] hover:bg-[#6639E4] opacity-80 hover:opacity-100 hover:px-[30px] hover:h-[54px] h-[50px] rounded-full px-[26px] text-[white] transition-all duration-150"
                                onClick={() => {dispatch(showWalletConnector())}}> 
                                <div className='mr-[10px]'>
                                    <FontAwesomeSvgIcon icon={ faUser } className="w-[20px] h-[20px]"/>
                                </div>
                                Login
                            </button>
                        </div> */}
                        <div className='hidden lg:flex items-center'>

                            {/* <button className='bg-[#3434FF] hover:bg-[#2C23D2] text-[white] rounded-[6px] h-[50px] px-[20px] flex items-center justify-center'
                                onClick={() => {console.log(chainId)}}>
                                Sign Up
                            </button> */}
                        </div>
                    </div>

                </div>
                {/* <div className='absolute top-[80px] w-full'>
                    <Image src='/images/shadow-separator-wide-bottom.png' w
                    idth={2044} height={41} alt='' />
                </div> */}
                {isWalletConnector &&
                    <WalletConnector />
                }
            </div>
            <div className="w-full flex w-full justify-center">
                <div className="w-full h-[5rem] bg-[#e0e0e040] backdrop-blur-sm flex items-center px-[15rem]">
                    <h1 className="text-white text-[1.5rem] whitespace-nowrap"> Next round in 3d 5h 24m </h1>
                </div>
            </div>
        </div>

    )
}
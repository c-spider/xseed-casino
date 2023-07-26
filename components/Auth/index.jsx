import { faEnvelope, faKey, faMailBulk, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { showWalletConnector } from "store/slices/utilSlice";

export default function Auth() {
    const dispatch = useDispatch()
    const [isRegister, openRegister] = useState(false)

    return (
            <div className="my-[50px] bg-[#20182C] min-w-[500px] max-w-[700px] flex flex-col p-[50px] rounded-[10px] transition-all duration-300">
                { !isRegister ? 
                    <div className="flex flex-col">
                        <div>
                            <h3 className="text-[24px] text-white text-center mb-[20px]"> Login </h3>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none " type="email" placeholder="Email"/>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faKey} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none " type="password" placeholder="Password"/>
                        </div>
                        <div className="flex flex-col justify-center items-center mt-[10px]">
                            <div className="h-[50px] flex items-center">
                                <button className="bg-[#6639E4] hover:bg-[#282454] opacity-100 hover:opacity-80 hover:px-[36px] hover:h-[45px] h-[50px] rounded-full px-[40px] text-[white] transition-all duration-150"> Login </button>
                            </div>
                            <div className=" mt-[10px] flex">
                                <p className="text-[#a09fb4]"> Don&apos;t have an account? </p> 
                                <button className="ml-[10px] text-[#6639E4] underline-offset-2
                                hover:underline"
                                    onClick={() => openRegister(!isRegister)}
                                > Create an account. </button>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="flex flex-col">
                        <div>
                            <h3 className="text-[24px] text-white text-center mb-[20px]"> Sign Up </h3>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="text" placeholder="First name"/>
                            <div className="w-[5px] h-[50px] bg-[black]"></div>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="text" placeholder="Last name"/>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faPhone} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="text" placeholder="Phone Number"/>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="email" placeholder="Email"/>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faKey} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="password" placeholder="Password"/>
                        </div>
                        <div className="mb-[10px] h-[50px] bg-white rounded-[10px] px-[20px] flex items-center">
                            <FontAwesomeIcon icon={faKey} className="text-[#303030] mr-[10px]"/>
                            <input className="grow bg-transparent text-[14px] outline-none px-[10px]" type="password" placeholder="Confirm Password"/>
                        </div>
                        <div className="flex flex-col justify-center items-center mt-[10px]">
                            <div className="flex justify-center items-center">
                                <div className="h-[50px] flex items-center">
                                    <button className=" bg-[#282454] hover:bg-[#6639E4] opacity-80 hover:opacity-100 mr-[10px] hover:px-[36px] hover:h-[45px] h-[50px] rounded-full px-[40px] text-[white] transition-all duration-150"
                                        onClick={()=> {alert(10), dispatch(showWalletConnector())}}
                                    > Connect Wallet </button>
                                </div>
                                <div className="h-[50px] flex items-center">
                                    <button className="bg-[#6639E4] hover:bg-[#282454] opacity-100 hover:opacity-80 hover:px-[36px] hover:h-[45px] h-[50px] rounded-full px-[40px] text-[white] transition-all duration-150"> Sign up </button>
                                </div>
                            </div>
                            
                            <div className=" mt-[10px] flex">
                                <p className="text-[#a09fb4]"> Already have an account? </p> 
                                <button className="ml-[10px] text-[#6639E4] underline-offset-2
                                hover:underline"
                                    onClick={() => openRegister(!isRegister)}
                                > Login Now. </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
    )
}
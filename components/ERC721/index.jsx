import { useState } from "react"
import { FactoryAddress } from "config";
import { FACTORY_ABI } from "config/abi";
import Web3 from "web3";

export default function ERC721() {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("")
    const [decimals, setDecimals] = useState(18)
    const [totalSupply, setTotalSupply] = useState("100000000")
    const [baseURL, setBaseURL] = useState("")
    const [extension, setExtension] = useState("")

    // Read
    async function callSmartContract(contract, func, args) {
        if(!contract) return false;
        if(!contract.methods[func]) return false;
        return contract.methods[func](...args).call();
    }
    
    // Write
    async function runSmartContract(contract, func, value, args) {
        if(!contract) return false;
        if(!contract.methods[func]) return false;
        return await contract.methods[func](...args).send({ from: "account", value: value })
    }
    
    async function estimateGas(contract, func, value, args) {
        try {
            const gasAmount = await contract.methods[func](...args).estimateGas({from: "account", value: value});
            return {
                success: true,
                gas: gasAmount
            }
        } catch(e) {
            if(e.message.startsWith("Internal JSON-RPC error.")) {
                e = JSON.parse(e.message.substr(24));
            }
            return {
                success: false,
                gas: -1,
                message: e.message
            }
        }
    }
    
    const approve = async() => {
        if(allowance < usdtAmount) {
          await setAllowance(USDTAddress, usdtAmount);
        }
    }
    
    const createToken = async() => {
        try {
        //   dispatch(showSpinner());

        console.log("Creating at ", FactoryAddress[chainId])
          const web3 = new Web3(library.provider);
          const factoryContract = new web3.eth.Contract(FACTORY_ABI , FactoryAddress[chainId]);
    
          const args = [721, name, symbol, baseURL, extension, totalSupply];
          const func = "CreateNFT";
          const {success, gas, message}  = await estimateGas(factoryContract, func, "100000000000000000", args);
          if(!success) {
            //   dispatch(hideSpinner());
            //   toast.error(message);
            console.log("err", message, gas)
              return;
          }
          const res = await runSmartContract(factoryContract, func, "100000000000000000", args);
        //   await getAllowance(USDTAddress);
        //   alert("Buy success");
        //   dispatch(hideSpinner());
        //   setUSDTAmount(0);
        //   toast.success("Buy Success");
        } catch (e) {
          console.log(e);
        //   dispatch(hideSpinner());
        //   toast.error("Transaction failed");
        }
    }

    const onCreateBtn = async () => {
        await createToken()
    }

    return (
        <div className="flex flex-col p-[20px] py-[40px]">
            <div className="flex">
                <div className="flex flex-col grow mr-[20px]">
                    <div className="flex items-center mb-[10px]">
                        <p className="min-w-[150px] text-white">
                            Name:
                        </p>
                        <input value={name} onChange={(e) => {setName(e.target.value)}} type="text" className="grow outline-none bg-[white] px-[10px] py-[5px] text-[black]" placeholder="Token Name"/>
                    </div>
                    <div className="flex items-center mb-[10px]">
                        <p className="min-w-[150px] text-white">
                            Symbol:
                        </p>
                        <input value={symbol} onChange={(e) => {setSymbol(e.target.value)}} type="text" className="grow outline-none bg-[white] px-[10px] py-[5px] text-[black]" placeholder="Token Symbol"/>
                    </div>
                    <div className="flex items-center mb-[10px]">
                        <p className="min-w-[150px] text-white">
                            Total Supply:
                        </p>
                        <input value={totalSupply} onChange={(e) => {setTotalSupply(e.target.value)}} type="Number" className="grow outline-none bg-[white] px-[10px] py-[5px] text-[black]" placeholder="Supply"/>
                    </div>
                    <div className="flex items-center mb-[10px]">
                        <p className="min-w-[150px] text-white">
                            baseURL:
                        </p>
                        <input value={baseURL} onChange={(e) => {setBaseURL(e.target.value)}} type="text" className="grow outline-none bg-[white] px-[10px] py-[5px] text-[black]" placeholder="https://ipfs.io/ipfs/QmVsbvLmduqvTf4j9qu6RuV4964Vkhb6abaVBbtSed3GJE"/>
                    </div>
                    <div className="flex items-center mb-[10px]">
                        <p className="min-w-[150px] text-white">
                            extension:
                        </p>
                        <input value={extension} onChange={(e) => {setExtension(e.target.value)}} type="text" className="grow outline-none bg-[white] px-[10px] py-[5px] text-[black]" placeholder="*.json"/>
                    </div>
                </div>
                <div className="w-[210px] h-[210px] bg-[white] rounded-[12px]">
                    
                </div>
            </div>
            <div className="flex justify-center items-center">
                <button className="max-w-[320px] bg-[#0078ff] px-[20px] py-[10px] text-[white] grow"
                    onClick={() => { onCreateBtn ()}}
                >
                    CREATE ERC721
                </button>
            </div>
        </div>
    )
}
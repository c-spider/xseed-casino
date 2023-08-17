// require('dotenv').config()
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const ethers = require('ethers')
const db = require("./models/_index");
const { start } = require('repl');

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const LOTTERY_ABI=[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_lotteryToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdt",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "router",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "paymentCoin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32[]",
        "name": "values",
        "type": "uint32[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrize",
        "type": "uint256"
      }
    ],
    "name": "BuyEvent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startAt",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endAt",
        "type": "uint256"
      }
    ],
    "name": "RoundCompleteEvent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "value",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalPrize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundStartAt",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundEndAt",
        "type": "uint256"
      }
    ],
    "name": "RoundStartEvent",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "USDT_ADDRESS",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stableCoin",
        "type": "address"
      }
    ],
    "name": "addPaymentToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "addToBlacklist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "blacklist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_paymentCoin",
        "type": "address"
      },
      {
        "internalType": "uint32[]",
        "name": "values",
        "type": "uint32[]"
      }
    ],
    "name": "buy",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32[]",
        "name": "values",
        "type": "uint32[]"
      }
    ],
    "name": "buyXSeed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "completeRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentCap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dexRouterAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "lotteryAmount",
        "type": "uint256"
      }
    ],
    "name": "getEstimatedTokens",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getEstimatedUSD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getEstimations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getRoundStatus",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalPrize",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "_value",
        "type": "uint32"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "roundId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "value",
            "type": "uint32"
          },
          {
            "internalType": "uint8",
            "name": "score",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "rewards",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isWithdrawn",
            "type": "bool"
          }
        ],
        "internalType": "struct Lottery.Winner[]",
        "name": "_winners",
        "type": "tuple[]"
      },
      {
        "internalType": "uint32[7]",
        "name": "_winCounts",
        "type": "uint32[7]"
      },
      {
        "internalType": "bool",
        "name": "_isRunning",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenAddr",
        "type": "address"
      }
    ],
    "name": "getTokenStatus",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "investors",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isPaymentToken",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isRunning",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lotteryTokenAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paymentTokenCount",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "paymentTokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stableCoin",
        "type": "address"
      }
    ],
    "name": "removePaymentToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "rewardPercentage",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "round",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundDurationTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundEndAt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundStartAt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "setBurnAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_lotteryToken",
        "type": "address"
      }
    ],
    "name": "setLotteryToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16[]",
        "name": "p",
        "type": "uint16[]"
      }
    ],
    "name": "setRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "setRoundDurationTime",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "setServiceWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "setTicketPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint32[]",
        "name": "values",
        "type": "uint32[]"
      },
      {
        "internalType": "uint8[]",
        "name": "scores",
        "type": "uint8[]"
      }
    ],
    "name": "setWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "number",
        "type": "uint32"
      }
    ],
    "name": "startRound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "totalPrizes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winnerAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winnerReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winnerScore",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "winnerValues",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winners",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "value",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "score",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "rewards",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isWithdrawn",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winningNumbers",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      if (pathname === '/a') {
        await app.render(req, res, '/a', query)
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, async () => {

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPCURL);
        const wallet = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
        let contract = new ethers.Contract(process.env.LOTTERY_ADDRESS, LOTTERY_ABI, provider);
        const lotteryContract = new ethers.Contract(process.env.LOTTERY_ADDRESS, LOTTERY_ABI, wallet);

        // let eventFilter = contract.filters.BuyEvent()
        // let events = await contract.queryFilter(eventFilter)
        // console.log("all events", events);

        contract.on("BuyEvent", async (roundId, buyer, paymentCoin, values, totalPrize) => {
          console.log("BuyEvent--------------------------");
          const id = 0 + roundId.toString();
          const r = await db.LotteryRound.findByPk(id);
          r.totalPrize = totalPrize.toString();
          await r.save();

          let f = await contract.blacklist(id, buyer);
          console.log(f, values);
          const _values = [];
          const _scores = [];
          if(f) return ;
          for(let i = 0 ; i < values.length; i++) {
            const request = await db.BuyRequest.findOne({
              where : {
                roundId: id,
                wallet: buyer,
                paymentCoin,
                value: ("000000" + values[i].toString()).slice(-6),
                status: 1,
              }
            });
            if(!request) {
              if(!f) {
                const tx = await lotteryContract.addToBlacklist(buyer);
                console.log("blacklist: ", tx.hash)
                f = true;
              }
            } else {
              if(f) {
                request.status = 2;
              } else {
                request.status = 0;
                if(request.score > 0) {
                  _values.push(request.value);
                  _scores.push(request.score);  
                }
              }
              await request.save();
              console.log("transaction confirmed: ", request)
            }
          }
          if(!f && _values.length > 0) {
            console.log(_values, _scores);
            const tx = await lotteryContract.setWinner(id, buyer, _values, _scores);
            console.log(tx);
          }
        })

        contract.on("RoundStartEvent", async (roundId, value, totalPrize, startAt, endAt) => {
          console.log("RoundStarted--------------------------")
          const round = await db.LotteryRound.findByPk(roundId.toString());
          round.startAt = startAt.toString();
          round.endAt = endAt.toString();
          round.status = 2;
          round.totalPrize = totalPrize.toString();
          await round.save();
        })

        contract.on("RoundCompleteEvent", async (roundId, totalPrize, startAt, endAt) => {
          console.log("RoundCompleted--------------------------")

          const round = await db.LotteryRound.findByPk(roundId.toString());
          round.totalPrize = totalPrize.toString();
          round.status = 3;
          round.endAt = endAt.toString();
          await round.save();
        })

          // const wallet = new ethers.Wallet.fromMnemonic(mnemonic).connect(target_provider);
        //   const transferContract = new ethers.Contract(getChain(chains, chainId).contract, LOTTERYABI
        // , wallet);
        //   const tokenId = getTokenId(tokens, token, chain.chainId);

        //   const destTokenAddr = getTokenAddress(tokens, tokenId, chainId);

        //   try {
        //     const tx = await transferContract.claimERC20To(sender, destTokenAddr, amount, chain.chainId, _key);
        //     const transaction = await db.Transaction.build({
        //       tokenId: tokenId,
        //       chainFrom: chain.id,
        //       chainTo: getChain(chains, chainId).id,
        //       wallet: sender,
        //       amount: amount.toString(),
        //       txDeposit: "",
        //       txClaim: tx.hash,
        //       index: _key.toString(),
        //       status: 0,
        //     })

        //     await transaction.save()
        //   } catch (e) {
        //     console.error(`Failed to send transaction: ${error}`);
        //   }
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

//0x1D19181B43E26D1A595c7180485c8FAf313EDc46
//0xE473423D403b61715EeE24AB9B74bf72038867ce
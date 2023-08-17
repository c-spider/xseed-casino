import {
    createSlice,
    PayloadAction,
  } from '@reduxjs/toolkit';
  
  const initialState = {
    loaded: false,
    currentRound: {},
    roundList: [],
    comment: "Running",
    endTime: new Date(),
    ticketPrice: "1000000000000000000",
    totalPrize: 1,
    roundId: 1,
    isRunning: false,
    isOverlay: false,
    lotteryPrice: "1.00",
    ticketCount: 0,
    rewardRule: [5, 2 ,5 , 8 , 15, 20, 50, 5]
  };
  
  export const utilSlice = createSlice({
    name: 'util',
    initialState,
    reducers: {
      setRoundList: (state, action) => {
        state.roundList = action.payload['roundList'];
      },

      showOverlay: (state, action) => {
        state.isOverlay = true;
        state.comment = action.payload;
      },

      hideOverlay: (state) => {
        state.isOverlay = false;
      },

      setRoundStatus: (state, action) => {
        state.currentRound = action.payload.currentRound;
        state.endTime = action.payload.endTime;
        state.roundId = action.payload.roundId;
        state.isRunning = action.payload.isRunning;
        state.ticketPrice = action.payload.ticketPrice;
        state.totalPrize = action.payload.totalPrize;
        state.lotteryPrice = action.payload.lotteryPrice;
        state.ticketCount = action.payload.ticketCount;
        state.rewardRule = action.payload.rewardRule;
      },

      setLoaded: (state) => {
        state.loaded = true;
      },
    },
  });
  // Here we are just exporting the actions from this slice, so that we can call them anywhere in our app.
  export const {
    setRoundList,
    showOverlay,
    hideOverlay,
    setRoundStatus,
    setLoaded
  } = utilSlice.actions;
  
  // exporting the reducer here, as we need to add this to the store
  export default utilSlice.reducer;
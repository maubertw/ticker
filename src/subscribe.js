
const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
    ],
    "channels": [
        "level2",
    ]
  }



export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));

  });

//need to make sure the type is correct in the search bids function while continuing to work on the tick logic.  zeros are taken care of, now we have duplicates

function searchBids(price, bids) {
    price = parseFloat(parseFloat(price).toFixed(2))
    let start = 0
    let stop = bids.length - 1
    let middle = Math.floor((start + stop) / 2)
    //console.log(bids.length)
    while (middle > 2 && +bids[middle][0] !== price && start < stop) {
        if (price < +bids[middle][0]) {
        stop = middle - 1
        } else {
        start = middle + 1
        }
        middle = Math.floor((start + stop) / 2)
    }
    return (+bids[middle][0] !== price) ? [-1, middle] : [1, middle]
}



const findMidPrice = bidList => {
    let total = bidList.reduce((mid, bid) => {
        return mid + (+bid[0])
    }, 0)
    return total/bidList.length
}


const findTotalShares = bidList => {
    return bidList.reduce((total, bid) => {
        return total + (+bid[1])
    }, 0)
}



const findTotalSharesAndMedianPrice = bidList => {
    let totalShares = 0
    let midPrice = 0
    bidList.forEach(bid => {
        totalShares += (+bid[1])
        midPrice += (+bid[0])
    })
    midPrice = midPrice/bidList.length
    return { midPrice, totalShares }
}


export function wssIntake (newState){
    let splitIndex;
    let midPrice;
    let totalShares;
    let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
    midPrice = newSharesAndMedian.midPrice
    totalShares = newSharesAndMedian.totalShares
    //console.log('here', midPrice, totalShares, newState)
    splitIndex = searchBids(midPrice, newState)[1]
    return {splitIndex, newState, totalShares, newMidPrice: midPrice}
}


export function wssTick (changes, state, lastSplit, lastMid) {

  let newState;
  let splitIndex;
  let midPrice;
  let totalShares;
  //determine if that price exists
//    console.log('changes', changes)
//console.log('state', state)
  let newPricePointIndex = searchBids(changes[1], state)
  const index = newPricePointIndex[1]
  const match = newPricePointIndex[0]
  //declare the new bid
  let newBid = [+changes[1], +changes[2]]
  if(parseFloat(newBid[1]) === 0){
      newState = [...state.slice(0, index), ...state.slice(index+1)]
      let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
      midPrice = newSharesAndMedian.midPrice
      totalShares = newSharesAndMedian.totalShares
      splitIndex = searchBids(midPrice, newState)[1]
      return {splitIndex, newState, totalShares, newMidPrice: midPrice}

  }
  let price = (state[index][0]*100).toFixed()
  let incomingPrice = (newBid[0]*100).toFixed()

  //and the price point is the same, replace it
  if((newBid[0]*100).toFixed() === (state[index][0]*100).toFixed()){
      let tempState = state.filter(bid => {
        let bidPrice = (bid[0]*100).toFixed()
        return bidPrice !== price
      })
      newState = [...tempState, newBid]
      splitIndex = lastSplit
      midPrice = lastMid
      totalShares = findTotalShares(newState)
      return {splitIndex, newState, totalShares, newMidPrice: midPrice}
  }else if(match === -1){
      //console.log('incoming', incomingPrice === price, incomingPrice, price)
      //place it where it needs to go
      newState = [...state, newBid]
      //everything has to change
      let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
      midPrice = newSharesAndMedian.midPrice
      totalShares = newSharesAndMedian.totalShares
      splitIndex = searchBids(midPrice, newState)[1]
      return {splitIndex, newState, totalShares, newMidPrice: midPrice}

  }

}



// export function wssTick (changes, state, lastSplit, lastMid) {

//     let newState;
//     let splitIndex;
//     let midPrice;
//     let totalShares;
//     //determine if that price exists
//     let newPricePointIndex = searchBids(changes[1], state)
//     const index = newPricePointIndex[1]
//     //declare the new bid
//     let newBid = [+changes[1], +changes[2]]
//     if(parseFloat(newBid[1]) === 0){
//         newState = [...state.slice(0, index), ...state.slice(index+1)]
//         console.log('new', newState)
//         let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
//         midPrice = newSharesAndMedian.midPrice
//         totalShares = newSharesAndMedian.totalShares
//         splitIndex = searchBids(midPrice, newState)[1]
//         return {splitIndex, newState, totalShares, newMidPrice: midPrice}

//     }
//     //and the price point is the same, replace it
//     if(newBid[1] === state[index][0] && newPricePointIndex > 0){
//         state.splice(newPricePointIndex[1], 1, newBid)
//         newState = state.slice
//           //everything except the total shares stays the same
//           splitIndex = lastSplit
//           midPrice = lastMid
//           totalShares = findTotalShares(newState)
//     }else{
//         //place it where it needs to go
//         state.splice(newPricePointIndex[1], 0, newBid)
//         newState = state
//         //everything has to change
//         let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
//         midPrice = newSharesAndMedian.midPrice
//         totalShares = newSharesAndMedian.totalShares
//         splitIndex = searchBids(midPrice, newState)[1]

//     }
//     return {splitIndex, newState, totalShares, newMidPrice: midPrice}

// }









const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
    ],
    "channels": [
        "level2",
        {
            "name": "ticker",
            "product_ids": [
                "ETH-USD"
            ]
        }
    ]
  }



export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));

  });



function searchBids(price, bids) {
    let start = 0
    let stop = bids.length - 1
    let middle = Math.floor((start + stop) / 2)
    while (+bids[middle][0] !== price && start < stop) {
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
    splitIndex = searchBids(midPrice, newState)[1]
    return {splitIndex, newState, totalShares, newMidPrice: midPrice}
}


export function wssTick (changes, state, lastSplit, lastMid) {
    let newState;
    let splitIndex;
    let midPrice;
    let totalShares;
    //determine if that price exists
    let newPricePointIndex = searchBids(changes[1], state)
    //declare the new bid
    let newBid = [+changes[1], +changes[2]]
    if(newPricePointIndex[0] > 0){
      //if it exists replace the old one with the new updated shares
      newState = state.splice(newPricePointIndex[1], 1, newBid)
      //everything except the total shares stays the same
      splitIndex = lastSplit
      midPrice = lastMid
      totalShares = findTotalShares(newState)
    }else{
        //place it where it needs to go
        state.splice(newPricePointIndex[1], 0, newBid)
        newState = state
        //everything has to change
        let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
        midPrice = newSharesAndMedian.midPrice
        totalShares = newSharesAndMedian.totalShares
        splitIndex = searchBids(midPrice, newState)[1]
        }
    return {splitIndex, newState, totalShares, newMidPrice: midPrice}
}







const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
        "ETH-EUR"
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

  // Create WebSocket connection.
//const socket = new WebSocket('wss://ws-feed.pro.coinbase.com');

  // Connection opened

export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));
  });

  // Listen for messages



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
    return bidList.reduce((mid, bid) => {
        return mid + (+bid[1])
    }, 0)/2
}

const findTotalShares = bidList => {
    return bidList.reduce((total, bid) => {
        return total + (+bid[2])
    }, 0)
}

const findTotalSharesAndMedianPrice = bidList => {
    let totalShares = 0
    let midPrice = 0
    bidList.forEach(bid => {
        totalShares += +bid[2]
        midPrice += +bid[1]
    })
    midPrice = midPrice/2
    return { midPrice, totalShares }
}

//outputs: split index, median price, total units in the market, updated units

//need to check the message type before this is run
export function wssIntake (message, state, lastSplit, lastMid) {
    let newState;
    let splitIndex;
    let midPrice;
    let totalShares;
    if (message.type === 'snapshot'){
        //if this is the first message, we use the new array as state
        newState = message.bids
        let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
        midPrice = newSharesAndMedian.midPrice
        totalShares = newSharesAndMedian.totalShares
        splitIndex = searchBids(midPrice, newState)[1]
    } else if(message.type === 'l2update'){
        //extract the part to be changes
        let { changes } = message
        //determine if that price exists
        let newPricePointIndex = searchBids(changes[1], state)
        //declare the new bid
        let newBid = [changes[1], changes[2]]
        if(newPricePointIndex[0] > 0){
            //if it exists replace the old one with the new updated shares
            newState = state.splice(newPricePointIndex[1], 1, newBid)
            //everything except the total shares stays the same
            splitIndex = lastSplit
            midPrice = lastMid
            totalShares = findTotalShares(newState)
        }else{
            //place it where it needs to go
            newState = state.splice(newPricePointIndex[1], 0, newBid)
            //everything has to change
            let newSharesAndMedian = findTotalSharesAndMedianPrice(newState)
            midPrice = newSharesAndMedian.midPrice
            totalShares = newSharesAndMedian.totalShares
            splitIndex = searchBids(midPrice, newState)[1]
        }
      }
      //determine the split index
      return {splitIndex, newState, totalShares, newMidPrice: midPrice}
    }


//export default {open, listen}




// const exampleData = [

// {"type":"l2update",
// "product_id":"ETH-USD",
// "time":"2018-12-07T15:48:35.907Z",
// "changes":[["buy","85.59000000","0.01"]]},

// {"type":"l2update",
// "product_id":"ETH-EUR",
// "time":"2018-12-07T15:48:35.911Z",
// "changes":[["sell","76.45000000","0"]]},

// {"type":"l2update",
// "product_id":"ETH-USD",
// "time":"2018-12-07T15:48:35.915Z",
// "changes":[["buy","85.26000000","12.51295965"]]},

// {"type":"l2update",
// "product_id":"ETH-USD",
// "time":"2018-12-07T15:48:35.943Z",
// "changes":[["sell","85.69000000","20"]]}
// ]





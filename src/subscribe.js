
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


export function wssIntake (feed){
    let splitIndex;
    let midPrice;
    let totalShares;
    let newState = {}
    feed.forEach(bid => {
        let key = (bid[0]*100).toFixed()
        let value = (bid[1]*100).toFixed()
        newState[key] = value
    })
    let newSharesAndMedian = findTotalSharesAndMedianPrice(feed)
    midPrice = newSharesAndMedian.midPrice
    totalShares = newSharesAndMedian.totalShares
    splitIndex = feed.length/2
    return {splitIndex, newState, totalShares, newMidPrice: midPrice}
}


export function wssTick (changes, state, lastSplit, lastMid) {

  let newState = {...state}
  let splitIndex;
  let midPrice;
  let totalShares;
  let price = (+changes[1]*100).toFixed()
  let size = (+changes[2]*100).toFixed()
  console.log('hello', size)

  if(state[price]){
      if(+size === 0){
        delete newState[price]
      }else{
          newState[price] = size
      }
  }else if(+size !== 0){
      newState[price] = size
  }
  let prices = Object.keys(newState)
  midPrice = prices.reduce((a, b) => {return +a + (+b)})/prices.length
  splitIndex = Object.keys(newState).length/2
  totalShares = Object.values(newState).reduce((a, b) => {return +a + (+b)})/prices.length

  return {splitIndex, newState, totalShares, newMidPrice: midPrice}
}







// const findMidPrice = bidList => {
//     let total = bidList.reduce((mid, bid) => {
//         return mid + (+bid[0])
//     }, 0)
//     return total/bidList.length
// }


// const findTotalShares = bidList => {
//     return bidList.reduce((total, bid) => {
//         return total + (+bid[1])
//     }, 0)
// }

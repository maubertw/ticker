
const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
    ],
    "channels": [
        "level2",
    ]
  }

  export const unsubscribe = {
    "type": "unsubscribe",
    "product_ids": [
        "ETH-USD",
    ],
    "channels": [
        "level2",
    ]
}

export const date = (self) => {
    setInterval(
        () => self.setState({
          date: JSON.stringify(Date(Date.now()))
        }),
        1000
      )
}

export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));

  });

const insertBid = (feed, bid) => {
    let closestIndex = Math.floor(feed.length/2)
    let low = 0
    let high = feed.length-1
    let mid = Math.floor(feed.length/2)
    while(low < high){

      if( Math.abs(+feed[mid] - (+bid)) < Math.abs(+feed[closestIndex] - (+bid)) ){
          closestIndex = mid
      }
      if(+feed[mid] > +bid){
          high = mid - 1
          mid = Math.floor(high-mid/2)
      }else{
          low = mid + 1
          mid = Math.floor(high+low/ 2)
      }
    }
    let sortedFeed = [...feed.slice(0, closestIndex, bid, ...feed.slice(closestIndex))]
    return sortedFeed
}


export const handleWSSFeed = (self) => {
  self.socket.addEventListener('message', function(event){
        event = JSON.parse(event.data)
        if(event.type == "snapshot" && !self.state.isSet){
          const {splitIndex, newState, totalShares, newMidPrice, sortedFeed, totalOfPrices } = wssIntake(event.bids.slice(0, 200))
          self.setState({
            splitIndex,
            mid: newMidPrice,
            total: totalShares,
            units: newState,
            isSet: true,
            sortedFeed,
            totalOfPrices
          })
        }else if(event.type == "l2update" && event.changes[0][0] == "buy"){

          const {splitIndex, newState, newMidPrice, sortedFeed, totalOfPrices, totalShares} = wssTick
          (event.changes[0], self.state.units, self.state.splitIndex, self.state.lastMid, self.state.sortedFeed, self.state.totalOfPrices, self.state.total)
          self.setState({
            splitIndex,
            mid: newMidPrice,
            total: totalShares,
            units: newState,
            sortedFeed,
            totalOfPrices
          })
         }
      })
}


function findMedian(allPrice, totalSize, bid, change, length, midPrice, type){
    let newTotalShares
    let newTotalPrice
    let newMid
    if(type === 'delete'){
        newTotalPrice = allPrice - (+bid[0])
        newTotalShares = totalSize - (+bid[1])
        newMid = newTotalPrice/length
    }else if(type === 'update'){
      newTotalShares = +bid[1] > +change[1]
        ? totalSize - (+bid[1] - +change[1])
        : totalSize + (+change[1] - +bid[1])
      newMid = midPrice
      newTotalPrice = allPrice
    }else if(type === 'add'){
        newTotalShares = totalSize + +change[1]
        newTotalPrice = allPrice + +change[0]
        newMid = newTotalPrice/(length+1)
    }
    return {newTotalPrice, newTotalShares, newMid}
}


const findTotalSharesAndMedianPrice = bidList => {
    let totalShares = 0
    let totalOfPrices = 0
    bidList.forEach(bid => {
        totalShares += (+bid[1])
        totalOfPrices += (+bid[0])
    })
    let midPrice = totalOfPrices/bidList.length
    return { midPrice, totalShares, totalOfPrices}
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
    let totalOfPrices = newSharesAndMedian.totalOfPrices
    midPrice = newSharesAndMedian.midPrice
    totalShares = newSharesAndMedian.totalShares
    splitIndex = feed.length/2
    let sortedFeed = Object.keys(newState).sort((a, b) => {
        return b - a
      })
    return {splitIndex, newState, newMidPrice: midPrice, sortedFeed, totalOfPrices, totalShares}
}

//totalShares

export function wssTick (changes, state, lastSplit, lastMid, sorted, totalOfPrices, totalShares) {
  let length = sorted.length
  let newState = {...state}
  let splitIndex;
  let midPrice;
  let totalNumShares;
  let newSortedFeed = [...sorted];
  let price = (+changes[1]*100).toFixed()
  let size = (+changes[2]*100).toFixed()
  if(state[price]){
      if(+size === 0){
        let { newTotalPrice, newTotalShares, newMid } = findMedian(totalOfPrices, totalShares, [price, state[price]], [price, size], state.length, lastMid,  'delete')
        let old = {...state}
        let {price, ...updated} = old;
        newSortedFeed = sorted.filter(bid => +bid[0] != price)
        midPrice = newMid
        totalNumShares = newTotalShares
        totalOfPrices = newTotalPrice
        length--
        newState = updated
      }else{
          newState[price] = size
          let { newTotalPrice, newTotalShares, newMid } = findMedian(totalOfPrices, totalShares, [price, state[price]], [price, size], state.length, lastMid,  'update')
          midPrice = newMid
          totalNumShares = newTotalShares
          totalOfPrices = newTotalPrice
      }
  }else{
      newState[price] = size
      let newSortedFeed =  insertBid(sorted, price)
      let { newTotalPrice, newTotalShares, newMid } = findMedian(totalOfPrices, totalShares, [price, state[price]], [price, size], state.length, lastMid,  'add')
      length++
      midPrice = newMid
      totalNumShares = newTotalShares
      totalOfPrices = newTotalPrice
  }
  return {splitIndex: length/2, newState, newMidPrice: midPrice, sortedFeed: newSortedFeed, totalOfPrices}
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

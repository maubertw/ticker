
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

  //produces very inaccurate results
  //esp with much lower indexes
  //need to find a way to get the correct index
const insertBid = (feed, bid) => {
    let closestIndex = 0
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
    let sortedFeed = [...feed.slice(0, closestIndex), bid, ...feed.slice(closestIndex)]
    return sortedFeed
}


export const handleWSSFeed = (self) => {
  self.socket.addEventListener('message', function(event){
        event = JSON.parse(event.data)
        if(event.type == "snapshot" && !self.state.isSet){
          const {splitIndex, newState, totalShares, newMidPrice, sortedFeed, totalOfPrices } = wssIntake(event.bids.slice(0, 50))

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
          const {splitIndex, newState, newMidPrice, sortedFeed, totalOfPrices, totalShares} = wssTick(event.changes[0],
            self.state.units,
            self.state.splitIndex, self.state.lastMid, self.state.sortedFeed, self.state.totalOfPrices, self.state.total)
          self.setState({
            splitIndex,
            mid: newMidPrice,
            lastMid: self.state.mid,
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
    //console.log('allprice total',allPrice,'total size', totalSize, 'bid', bid, 'newbid', change, 'length',length, 'midprice', midPrice, 'type', type)
    if(type === 'delete'){
        //console.log('allprice total', allPrice,'total size', totalSize, 'bid', bid, 'length',length, 'type', type)
        newTotalPrice = allPrice - (+bid[0])
        newTotalShares = totalSize - (+bid[1])
        newMid = newTotalPrice/length
        //console.log('newP', newTotalPrice, 'newS', newTotalShares, 'mid', newMid)
    }else if(type === 'update'){
      newTotalShares = +bid[1] > +change[1]
        ? Math.abs(totalSize - +bid[1] - +change[1])
        : Math.abs(totalSize + (+change[1] - +bid[1]))
      newMid = midPrice
      newTotalPrice = allPrice
    }else if(type === 'add'){
        newTotalShares = totalSize + +change[1]
        newTotalPrice = allPrice + +change[0]
        newMid = newTotalPrice/(length+1)
    }
     //console.log('total price, total shares, mid', newTotalPrice, newTotalShares, newMid)
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
    let newState = {}
    feed.forEach(bid => {
        let key = (bid[0]*100).toFixed()
        let value = (bid[1]*100).toFixed()
        newState[key] = value
    })
    let newSharesAndMedian = findTotalSharesAndMedianPrice(feed)
    let totalOfPrices = newSharesAndMedian.totalOfPrices
    let midPrice = newSharesAndMedian.midPrice
    let totalShares = newSharesAndMedian.totalShares
    let splitIndex = feed.length/2
    let sortedFeed = Object.keys(newState).sort((a, b) => {
        return b - a
      })
    return {splitIndex, newState, newMidPrice: midPrice, sortedFeed, totalOfPrices, totalShares}
}


export function wssTick (changes, state, lastSplit, lastMid, sorted, totalOfPrices, totalShares) {

    let length = sorted.length
    let newState = {...state}
    let splitIndex;
    let midPrice;
    let totalNumShares;
    let newSortedFeed = [...sorted];
    let price = (+changes[1]*100).toFixed()
    let size = (+changes[2]*100).toFixed()
    //console.log('one sh', totalShares, size)
    if(state[price]){
        //console.log('two sh', totalShares, size)
        if(+size === 0){
            //console.log('three sh', totalShares, size)
            let p = (+changes[1]*100).toFixed()
            let { newTotalPrice, newTotalShares, newMid } =
        findMedian(totalOfPrices,
            totalShares,
            [p, state[p]],
            [p, size],
            length,
            lastMid,
            'delete')
        midPrice = newMid
        console.log('delete', midPrice)
        totalNumShares = newTotalShares
        totalOfPrices = newTotalPrice
        length--
        //console.log('length1', length)
      }else{
          newState[price] = size
          let { newTotalPrice, newTotalShares, newMid } =
          findMedian(totalOfPrices,
            totalShares,
            [price, state[price]],
            [price, size],
            length,
            lastMid,
            'update')
          midPrice = newMid
          //keeps original mid
          console.log('update', midPrice)
          totalNumShares = newTotalShares
          totalOfPrices = newTotalPrice
      }
  }else{
      newState[price] = size
      newSortedFeed =  insertBid(sorted, price)
      let { newTotalPrice, newTotalShares, newMid } =
      findMedian(totalOfPrices,
        totalShares,
        [price, state[price]],
        [price, size],
        length,
        lastMid,
        'add')
      length++
      //console.log('length2', length)
      midPrice = newMid
      //mid is not a number
      console.log('add', midPrice)
      totalNumShares = newTotalShares
      totalOfPrices = newTotalPrice
  }
//   console.log('splitIndex', length/2, 'newState', newState, 'newMidPrice', midPrice, 'sortedFeed', newSortedFeed, 'price total', totalOfPrices)
  return {splitIndex: length/2, newState, newMidPrice: midPrice, sortedFeed: newSortedFeed, totalOfPrices, totalShares: totalNumShares}
}






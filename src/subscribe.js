const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
    ],
    "channels": [
        "level2",
        "matches"
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
        1000)
}


export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));
  });



//To insure no inaccuracies caused by floats this function takes the input price/size strings rounds to the second decimal place and returns them as strings so that they can be easily compared as either strings or integers
export function norm(num){
    return (num*100).toFixed()
  }


export const handleWSSFeed = (self) => {
    self.socket.addEventListener('message', async function(event){
        event = JSON.parse(event.data)
        if(event.type === "match"){
            let price = norm(event.price)
            self.setState({
              price,
              prevPrice: +self.state.price > 0 ? self.state.price : price
            })
        }
        if(event.type == "snapshot" && !self.state.isSet){
          const { bidBook, askBook, sortedBids, sortedAsks } = await wssIntake(event.bids.slice(0, 10), event.asks.slice(0, 10))
          await self.setState({
            bidBook,
            sortedBids,
            lowBid: sortedBids[9][0],
            askBook,
            sortedAsks,
            highAsk: sortedAsks[9][0],
            isSet: true,
          })
        }
        else if(event.type === "l2update"){
            let price = norm(event.changes[0][1])
            let size = norm(event.changes[0][2])
            if(event.changes[0][0] === "buy" && event.changes[0][1] > self.state.lowBid){
            let newBid = [price, size]
            let { newBook, newSorted } = l2update(newBid, self.state.bidBook, self.state.sortedBids, 'buy')
            self.setState({
                bidBook: newBook,
                sortedBids: newSorted
              })
            }
            if(event.changes[0][0] === "sell" && event.changes[0][1] < self.state.highAsk){
                let price = norm(event.changes[0][1])
                let size = norm(event.changes[0][2])
                let newAsk = [price, size]
                let { newBook, newSorted } = l2update(newAsk, self.state.bidBook, self.state.sortedBids, 'ask')
                self.setState({
                    askBook: newBook,
                    sortedAsks: newSorted
                    })
                }
            }
    })
}


function wssIntake(bids, asks){
    let bidBook = {}
    let askBook = {}
    bids.forEach(bid => {
        let key = norm(bid[0])
        let value = norm(bid[1])
        bidBook[key] = value
    })
    asks.forEach(ask => {
        let key = norm(ask[0])
        let value = norm(ask[1])
        askBook[key] = value
    })
    let sortedBids = Object.keys(bidBook).sort((a, b) => {
        return +b - +a
      })
    let sortedAsks = Object.keys(askBook).sort((a, b) => {
        return +a - +b
      })
    return { bidBook, askBook, sortedBids, sortedAsks }
}



function l2update(bid, book, sorted, type){
    let newBook = {...book}
    newBook[bid[0]] = bid[1]
    let newSorted = [...sorted]
    if(!book[bid[0]]){
      if(type === 'buy'){
          newSorted = [...newSorted, bid[0]].sort((a, b) => +a - +b)
      }else{
        newSorted = [...newSorted, bid[0]].sort((a, b) => +b - +a)
      }
    }
    return { newBook, newSorted }
}
















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

export const unsubscribeMessage = {
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
          date: Date(Date.now())
        }),
        1000)
}


export const open = (socket) => socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));
  });


//To insure no inaccuracies caused by floats this function takes the input
//price/size strings rounds to the second decimal place and returns them as
//strings so that they can be easily compared as strings or eaasily type
//coersed as integers
export function norm(num){
    return (num*100).toFixed()
}



export const handleWSSFeed = (self) => {
    self.socket.addEventListener('message', async function(event){
        event = JSON.parse(event.data)
        let previous = self.state.prevPrice
        if(event.type === "match"){
            let price = norm(event.price)
            let prev = previous !== 'unset' ? previous : price
            self.setState({
              price,
              prevPrice: prev
            })
        }
        if(event.type == "snapshot" && !self.state.isSet){
          const { bidBook, askBook, sortedBids, sortedAsks } = await wssIntake(event.bids.slice(0, 101), event.asks.slice(0, 101))
          await self.setState({
            bidBook,
            sortedBids,
            lowBid: sortedBids[75][0],
            askBook,
            sortedAsks,
            highAsk: sortedAsks[75][0],
            isSet: true
          })
        }
        else if(event.type === "l2update"){
            let price = norm(event.changes[0][1])
            let size = event.changes[0][2]
            if(event.changes[0][0] === "buy"){
                let newBid = [price, size]
                let { newBook, newSorted } = l2update(newBid, self.state.bidBook, self.state.sortedBids, 'buy')
                self.setState({
                    bidBook: newBook,
                    sortedBids: newSorted
                })
            }
            if(event.changes[0][0] === "sell"){
                let newAsk = [price, size]
                let { newBook, newSorted } = l2update(newAsk, self.state.bidBook, self.state.sortedBids, 'ask', self.state.lowBid)
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
        let value = bid[1]
        bidBook[key] = value
    })
    asks.forEach(ask => {
        let key = norm(ask[0])
        let value = ask[1]
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



function l2update(bid, book, sorted, type, low){
    let newBook = {...book}
    newBook[bid[0]] = bid[1]
    let newSorted = [...sorted]
    if(!book[bid[0]]){
      if(type === 'buy'){
          newSorted = [...newSorted, bid[0]].sort((a, b) => +b - +a)
      }else if(+bid[0] >= +low){
          newSorted = [...newSorted, bid[0]].sort((a, b) => +a - +b)
      }
    }
    return { newBook, newSorted }
}
















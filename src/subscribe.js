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
//strings so that they can be easily compared as strings or easily type
//coersed into integers
export function norm(num){
    return (num*100).toFixed()
}


//optimization:
//break each case into it's own function to make things cleaner
export const handleWSSFeed = (self) => {
    self.socket.addEventListener('message', function(event){
        event = JSON.parse(event.data)
        if(event.type === 'match'){
            let previous = self.state.prevPrice
            let price = norm(event.price)
            //optimization: having a databse keeping track on the previous data so that we don't always start at 0%
            let prev = previous !== 'unset' ? previous : price
            self.setState({
              price,
              prevPrice: prev
            })
        }
        if(event.type === 'snapshot' && !self.state.isSet){
          const { bidBook, askBook, sortedBids, sortedAsks } = wssIntake(event.bids.slice(0, 150), event.asks.slice(0, 150))
          self.setState({
            bidBook,
            sortedBids,
            askBook,
            sortedAsks,
            isSet: true
          })
        }
        else if(event.type === 'l2update'){
            let price = norm(event.changes[0][1])
            let size = event.changes[0][2]
            if(event.changes[0][0] === 'buy'){
                let newBid = [price, size]
                let { newBook, newSorted } = l2update(newBid, self.state.bidBook, self.state.sortedBids)
                self.setState({
                    bidBook: newBook,
                    sortedBids: newSorted
                })
            }
            if(event.changes[0][0] === 'sell'){
                let newAsk = [price, size]
                let { newBook, newSorted } = l2update(newAsk, self.state.askBook, self.state.sortedAsks)
                self.setState({
                    askBook: newBook,
                    sortedAsks: newSorted
                    })
                }
            }
    })
}



//optimization:
//reverse the asks, go through bids and asks turning them into strings and adding to the book at the same time
//let bidBook = {}
//let sortedBids = []
//let askBook = {}
//let sortedAsks = []
//for(let i = 0; i < bids.length; i++){
//     let bidKey = norm(bids[is][0])
//     let bidValue = bids[i][1]
//     let askKey = norm(asks[is][0])
//     let askValue = asks[i][1]
//     bidBook[bidKey] = bidValue
//     sortedBids.push(bidKey)
//     askBook[askKey] = askValue
//     sortedAsks.push(askKey)
// }
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
        return +b - +a
      })
    return { bidBook, askBook, sortedBids, sortedAsks }
}


//optimization:
//have a binary search insert method
function l2update(bid, book, sorted){
    let newBook = {...book}
    newBook[bid[0]] = bid[1]
    let newSorted = [...sorted]
    if(!book[bid[0]]){
          newSorted = [...newSorted, bid[0]].sort((a, b) => +b - +a)
    }
    return { newBook, newSorted }
}
















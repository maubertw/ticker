
const subscriptionMessage = {
    "type": "subscribe",
    "product_ids": [
        "ETH-USD",
        "ETH-EUR"
    ],
    "channels": [
        "level2",
        "heartbeat",
        {
            "name": "ticker",
            "product_ids": [
                "ETH-USD"
            ]
        }
    ]
  }

export default () => {
  // Create WebSocket connection.
  const socket = new WebSocket('wss://ws-feed.pro.coinbase.com');

  // Connection opened
  socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(subscriptionMessage));
  });

  // Listen for messages
  socket.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
  })
}

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


const findMidPrice = (bidList) => {
    return bidList.reduce((mid, bid) => {
        return mid + parseInt(bid[0])
    }, 0)
}

//outputs: index before where midprice should go, newMiddle, updated array

function intake (state = [], message, lastMid) {
    if(message.changes[0] === 'buy'){
        return null
    }
    let { bids } = message
    let newMid = findMidPrice(bids)
    //let middleIndex = searchBids(newMid, bids)
    let newState;
    if (message.type === 'snapshot'){
        newState = bids
    } else if(message.type === 'l2update'){
        let { changes } = message
        let change = searchBids(changes[1], bids)
        let newBid = [changes[1], changes[2]]
        if(change[0] === 1){
            newState = bids.splice(change[1], 1, newBid)
        }else{
            newState = bids.splice(change[1], 0, newBid)
        }
      }
    }
      //look for the price in the array
        //if it exists, replace the size
        //if it doesn't add it to the array
          //recalculate the median
          //replace the last median, and return the array
    //returning:
      //1.  the new units array
      //2.  the mid

//units on state = message.bids
      //calculate the current median price, set that on state, add a median arr to the arr

}


const exampleData = [

{"type":"l2update",
"product_id":"ETH-USD",
"time":"2018-12-07T15:48:35.907Z",
"changes":[["buy","85.59000000","0.01"]]},

{"type":"l2update",
"product_id":"ETH-EUR",
"time":"2018-12-07T15:48:35.911Z",
"changes":[["sell","76.45000000","0"]]},

{"type":"l2update",
"product_id":"ETH-USD",
"time":"2018-12-07T15:48:35.915Z",
"changes":[["buy","85.26000000","12.51295965"]]},

{"type":"l2update",
"product_id":"ETH-USD",
"time":"2018-12-07T15:48:35.943Z",
"changes":[["sell","85.69000000","20"]]}
]



//takes in a mesage and the current array(sorted)
//uses binary search or ratcheting to sort and place it
//returns the array

//market share and last median
//keep track of the current total
//when a new number gets added - add it to the total and





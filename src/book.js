import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import {open, wssIntake, wssTick, unsubscribe, date, handleWSSFeed } from './subscribe'

// date: JSON.stringify(Date(Date.now())),
//         splitIndex: 0,
//         mid: 0,
//         lastMid: 80,
//         total: 0,
//         units: {},
//         isSet: false,
//         sortedFeed: [],
//         totalOfPrices: 0


//pricelevels don't have to already be there - you can use the 1-100

class Book extends Component {
  constructor(){
    super()
    this.state = {
        date: JSON.stringify(Date(Date.now())),
        price: 0,
        prevPrice: 0,
        bidBook: {},
        sortedBids: [],
        lowBid: 0,
        askBook: {},
        sortedAsks: [],
        highAsk: 0,
        // askShares: 0,
        // bidShares: 0,
        isSet: false,
      }

  }


  componentDidMount() {
    this.intervalID = date(this)
    this.socket = new WebSocket('wss://ws-feed.pro.coinbase.com');
    open(this.socket)
    handleWSSFeed(this)
  }


  componentWillUnmount() {
    clearInterval(this.intervalID)
    this.socket.send(JSON.stringify(unsubscribe))
    this.socket.close()
  }


  render (){

    const { date, price, prevPrice, bidBook, sortedBids, askBook, sortedAsks } = this.state
    const change = price > prevPrice ? (((price-prevPrice)/prevPrice)*100).toFixed(2) : ''
    return(
      <div className='book'>
        <table>
          <th id='head' colSpan='2'>ORDERBOOK - ETH:USD<br/>
          <span className='date'>{date}</span>
          </th>
            <tbody>
              <span>
                 {
                  sortedAsks.length > 0 && sortedAsks.map(ask => {
                    if(askBook[ask] > 0){
                      return <Row bid={[ask, askBook[ask]]} />
                    }
                  })
                }
              </span>
              {
                price > 0 && <Mid mid={price} isUp={price > prevPrice} change={change} />
              }
              <span>
              {
                 sortedBids.length > 0 && sortedBids.map(bid => {
                  if(+bidBook[bid] > 0){
                    return <Row bid={[bid, bidBook[bid]]} />
                  }
                })
                }
              </span>
          </tbody>
        </table>
      </div>)
  }
}


export default Book

// percent={(+units[entry]/this.state.total)*10
//   percent={(+units[entry]/this.state.total)*10}

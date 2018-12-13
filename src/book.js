import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import {open, wssIntake, wssTick, unsubscribe, date, handleWSSFeed } from './subscribe'


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
               {
                  sortedAsks.length > 0 && sortedAsks.slice(0, 10).map(ask => {
                    if(askBook[ask] > 0){
                      return <Row bid={[ask, askBook[ask]]} type={'ask'} />}
                  })
                }
              { price > 0 && <Mid mid={price} isUp={price > prevPrice} change={change} /> }
                {
                  sortedBids.length > 0 && sortedBids.slice(0, 10).map(bid => {
                    if(+bidBook[bid] > 0){
                      return <Row bid={[bid, bidBook[bid]]} type={'bid'}/> }
                  })
                }
          </tbody>
        </table>
      </div>)
  }
}


export default Book


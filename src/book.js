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
        prevPrice: 'unset',
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


  //if the prev price is unset
    //change message = ''
  //else change message = ` ${change}%`





  render (){
    const { date, price, prevPrice, bidBook, sortedBids, askBook, sortedAsks } = this.state
    const change = price != prevPrice ? (((price-prevPrice)/prevPrice)*100).toFixed(2) : ''
    const isUp = price >= prevPrice ? 'green' : 'red'
    const changeMessage = prevPrice != 'unset' && prevPrice != price ? ` ${change}%` : '0%'

    return(
      <div className='book'>
          <h2 id='head' colSpan='2'>ORDERBOOK - ETH:USD<br/>
          <span className='date'>{date}</span>
          </h2>
        <div className='tableContainer'>
        <div className='center'>
        <table>
            <tbody>
               {
                  sortedAsks.length > 0 && sortedAsks.filter(ask => { return askBook[ask] != 0 }).slice(-49).map(ask => {
                      return <Row bid={[ask, askBook[ask]]} type={'ask'} classStyle='row green'/>})
                }
                </tbody>
            </table>
              { price > 0 ? <Mid price={price} isUp={isUp} changeMessage={changeMessage} />
                          : <div className='middleDisplay'>OBTAINING PRICE</div>
              }
              <table>
                <tbody>
                {
                  sortedBids.length > 0 && sortedBids.filter(bid => { return bidBook[bid] != 0 }).slice(0, 49).map(bid => {
                    if(+bidBook[bid] > 0){
                      return <Row bid={[bid, bidBook[bid]]} type={'bid'} classStyle='row red'/> }
                  })
                }
          </tbody>
        </table>
        </div>
        </div>
      </div>)
  }
}


export default Book


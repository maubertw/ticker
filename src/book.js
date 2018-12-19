import React, { Component } from 'react';
import Row from './row'
import CurrentPriceDisplay from './current-price-display'
import {open, date, handleWSSFeed } from './subscribe'


class Book extends Component {
  constructor(){
    super()
    this.state = {
        date: Date(Date.now()),
        price: 0,
        prevPrice: 'unset',
        bidBook: {},
        sortedBids: [],
        askBook: {},
        sortedAsks: [],
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
    this.socket.close()
  }



  render (){
    const { date, price, prevPrice, bidBook, sortedBids, askBook, sortedAsks } = this.state
    const isUp = price >= prevPrice ? 'green' : 'red'
    //optimization: move these calculations to the CurrentPriceDisplay component
    //separate the nested ternary on line 44
    const change = price !== prevPrice ? (((price-prevPrice)/prevPrice)*100).toFixed(2) : ''
    const changeMessage = prevPrice !== 'unset' && prevPrice !== price ? ` ${price > prevPrice ? '+': ''}${change}%` : '0%'

    return(
      <div className='book'>
          <h2 id='head'>ORDERBOOK - ETH:USD<br/>
            <span className='date'>{date}</span>
          </h2>
        <div className='tableContainer'>
          <table>
            <tbody>
                {
                  sortedAsks.length > 0 && sortedAsks.filter(ask => { return askBook[ask] != 0 }).slice(-99).map(ask => {
                      return <Row bid={[ask, askBook[ask]]} type={'ask'} classStyle='red'/>})
                }
              </tbody>
            </table>
            {
              //possible bug: change initial price to 'unset' instead of 0, incase it ever reaches 0
              price > 0 ? <CurrentPriceDisplay price={price} isUp={isUp} changeMessage={changeMessage} />
                        : <div className='middleDisplay'>OBTAINING CURRENT PRICE INFORMATION</div>
            }
            <table>
              <tbody>
                {
                  sortedBids.length > 0 && sortedBids.filter(bid => { return bidBook[bid] != 0 }).slice(0, 99).map(bid => {
                  return <Row bid={[bid, bidBook[bid]]} type={'bid'} classStyle='green'/> })
                }
              </tbody>
            </table>
        </div>
      </div>)
  }
}


export default Book


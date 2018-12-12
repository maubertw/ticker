import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import {open, wssIntake, wssTick, unsubscribe, date, handleWSSFeed } from './subscribe'



class Book extends Component {
  constructor(){
    super()
    this.state = {
        date: JSON.stringify(Date(Date.now())),
        splitIndex: 0,
        mid: 0,
        lastMid: 80,
        total: 0,
        units: {},
        isSet: false,
        sortedFeed: [],
        totalOfPrices: 0
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

    const { mid, lastMid, date, units, sortedFeed } = this.state
    const change = lastMid > 0 ? (((mid-lastMid)/lastMid)*100).toFixed(2) : ''
    return(
      <div className='book'>
        <table>
          <th id='head' colSpan='2'>ORDERBOOK - ETH:USD<br/>
          <span className='date'>{date}</span>
          </th>
            <tbody>
              <span>
                 {
                  sortedFeed.length > 0 && sortedFeed.slice(0, this.state.splitIndex).map(entry => {
                      return <Row bid={[entry, units[entry]]} />
                  })
                }
              </span>
              {
                sortedFeed.length > 0 && <Mid mid={mid} isUp={mid > lastMid} change={change} />
              }
              <span>
              {
                 sortedFeed.length > 0 &&  sortedFeed.slice(this.state.splitIndex).map(entry => {
                  return <Row bid={[entry, units[entry]]}  />
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

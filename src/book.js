import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import {open, wssIntake, wssTick } from './subscribe'



class Book extends Component {
  constructor(){
    super()
    this.state = {
        date: JSON.stringify(Date(Date.now())),
        splitIndex: 0,
        mid: 0,
        lastMid: 80,
        total: 0,
        units: [],
        isSet: false
      }

  }


  componentDidMount() {
    this.intervalID = setInterval(
      () => this.setState({
        date: JSON.stringify(Date(Date.now()))
      }),
      1000
    )
    this.socket = new WebSocket('wss://ws-feed.pro.coinbase.com');
    open(this.socket)
    let self = this
    this.socket.addEventListener('message', function(event){
      event = JSON.parse(event.data)
      if(event.type == "snapshot" && !self.state.isSet){
        const {splitIndex, newState, totalShares, newMidPrice} = wssIntake(event.bids.slice(0, 20))
        self.setState({
          splitIndex,
          mid: newMidPrice,
          total: totalShares,
          units: newState,
          isSet: true
        })
      }else if(event.type == "l2update" && event.changes[0][0] == "buy"){
        //console.log(event)
        const {splitIndex, newState, totalShares, newMidPrice} = wssTick(event.changes[0], self.state.units, self.state.splitIndex, self.state.lastMid)
        self.setState({
          splitIndex,
          mid: newMidPrice,
          total: totalShares,
          units: newState
        })
       }
    })
  }

  // newState = [...state.slice(0, index), ...newBid, ...state.slice(index+1)]
  //newState = [...state.slice(0, index+1), ...newBid, state.slice(index+1)]


  componentWillUnmount() {
    clearInterval(this.intervalID)
    this.socket.close()
  }


  render (){

    const { mid, lastMid, date, units } = this.state
    const entries = Object.keys(units).sort((a, b) => {
      return b - a
    })
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
                  entries.length > 0 && entries.slice(0, this.state.splitIndex).map(entry => {
                      return <Row bid={[entry, units[entry]]} percent={(+units[entry]/this.state.total)*10} />
                  })
                }
              </span>
              {
                entries.length > 0 && <Mid mid={mid} isUp={mid > lastMid} change={change} />
              }
              <span>
              {
                 entries.length > 0 &&  entries.slice(this.state.splitIndex).map(entry => {
                  return <Row bid={[entry, units[entry]]} percent={(+units[entry]/this.state.total)*10} />
                })
                }
              </span>
          </tbody>
        </table>
      </div>)
  }
}


export default Book




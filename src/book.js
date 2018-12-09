import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import units from './dummy-data'
import {open, wssIntake} from './subscribe'

//could make two aligned tables with the arr split by the high and low that places all the higher




class Book extends Component {
  constructor(){
    super()
    this.state = {
        date: JSON.stringify(Date(Date.now())),
        splitIndex: 0,
        mid: 0,
        lastMid: 0,
        total: 0,
        units
      }
      this.handleWSSFeed = this.handleWSSFeed.bind(this)
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
    let collectData = function(e) {
      self.handleWSSFeed(e)
    }
    this.socket.addEventListener('message', function(event){
      collectData(event)
    })
  }

  handleWSSFeed = (event) => {
    //console.log(event.data)
    let newData = wssIntake(event.data, this.state.units, this.state.splitIndex, this.state.mid)
        this.setState({
          splitIndex: newData.splitIndex,
          //units: newData.newState,
          total: newData.totalShares,
          mid: newData.newMidPrice
        })
  }


  componentWillUnmount() {
    clearInterval(this.intervalID)
    this.socket.close()
  }


  render (){
    const { mid, lastMid, date } = this.state
    const change = (((mid-lastMid)/lastMid)*100).toFixed(2)
    return(
      <div className='book'>
        <table>
          <th id='head' colSpan='2'>ORDERBOOK - ETH:USD<br/>
          <span className='date'>{date}</span>
          </th>
            <tbody>
              <span>
                {
                  this.state.units.slice(0, this.state.splitIndex).map(unit => {
                      return <Row unit={{...unit, percent: (unit.size/this.state.total)*100}} />
                  })
                }
              </span>
              <Mid mid={mid} isUp={mid > lastMid} change={change} />
              <span>
                {
                 this.state.units.slice( this.state.splitIndex).map(unit => {
                  return <Row unit={{...unit, percent: (unit.size/this.state.total)*100}} />
                })
                }
              </span>
          </tbody>
        </table>
      </div>)
  }
}


export default Book



//there will be something to sort all of the prices - that also must calculate the mid price
//binary tree that has the midpoint as the root node?
//an array that contains a midpoint that is being dynamically generated
//the additions get pushed or sliced in depending on where the midpoint is

//midpoint stableizer(arr, values){
  //returns an array that has the values sorted, and the midpoint

//}

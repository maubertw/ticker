import React, { Component } from 'react';
import Row from './row'
import Mid from './mid'
import units from './dummy-data'



class Book extends Component {
  constructor(){
    super()
    const total = units.reduce((total, unit) => total + unit.price, 0)
    this.state = {
        date: JSON.stringify(Date(Date.now())),
        mid: total/units.length,
        lastMid: 88,
        total,
        units
      }
  }

  componentDidMount() {
    this.intervalID = setInterval(
      () => this.setState({
        date: JSON.stringify(Date(Date.now()))
      }),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
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
              {
                this.state.units.map(unit => {
                  if(!unit.size){
                    return <Mid mid={mid} isUp={mid > lastMid} change={change} />
                  }else{
                    return <Row unit={{...unit, percent: (unit.size/this.state.total)*800}} />
                  }
                })
              }
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

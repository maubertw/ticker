import React from 'react'

export default ({price, isUp, changeMessage}) => {
  let priceDisplay = `$${price.slice(0, price.length-2)}.${price.slice(price.length-2)}`
  return (
    <div className='middleDisplay' >
      <div id='mid-price'>
      {priceDisplay}
      </div>
      <div id='mid-change' className={isUp}>
      {changeMessage}
      </div>
    </div>
  )
}

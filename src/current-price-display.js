import React from 'react'

export default ({price, isUp, changeMessage}) => {
  let priceDisplay = `$${price.slice(0, price.length-2)}.${price.slice(price.length-2)}`
  return (
    <div className='middleDisplay' >
        {priceDisplay}
        <span className={isUp}>{changeMessage}</span>
    </div>
  )
}

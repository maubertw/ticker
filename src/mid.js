import React from 'react'

export default ({price, isUp, changeMessage}) => {
  let priceDisplay = `$${price.slice(0, price.length-2)}.${price.slice(price.length-2)}`
  return (
    <tr id='middleDisplay'>
      <th id='mid-price'>
        {priceDisplay}
      </th>
      <th id='mid-change' className={isUp}>
        {changeMessage}
      </th>
    </tr>
  )
}

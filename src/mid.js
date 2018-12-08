import React from 'react'

export default ({mid, isUp, last, change}) => {
  return (
    <tr>
      <th id='mid' colSpan='2'>
        {mid}
        {isUp? '^' : 'v'}
       {change}%
      </th>
    </tr>
  )
}

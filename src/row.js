import React from 'react'


export default ({bid, classStyle, percent}) => {
  let p = bid[0]
  let price = `$${p.slice(0, p.length-2)}.${p.slice(p.length-2)}`
  return(
    <tr className={classStyle}>
      <td className='price'>
      {price}
      </td>
      <td className='size'>
      {bid[1]}
        {/* <span style={{'minWidth': percent }} className='percent'>{bid[1]}</span> */}
      </td>
    </tr>
  )
}


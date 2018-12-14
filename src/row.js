import React from 'react'


export default ({bid, classStyle, percent}) => {
  let p = bid[0]
  let price = `$${p.slice(0, p.length-2)}.${p.slice(p.length-2)}`
  return(
    <tr className='row'>
      <td className={`${classStyle} price`}>
      {price}
      </td>
      <td className='size'>
      <div className='front'>{bid[1]}</div>
      </td>
    </tr>
  )
}


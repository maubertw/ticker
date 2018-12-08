import React from 'react'


export default ({unit}) => {
  const { size, price, percent } = unit
  return(
    <tr className='row'>
      <td className='price'>
        {price}
      </td>
      <td className='size'>

        <span style={{'minWidth': percent }} className='percent'>{size}</span>
      </td>
    </tr>
  )
}


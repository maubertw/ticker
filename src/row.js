import React from 'react'


export default ({bid, percent}) => {
  return(
    <tr className='row'>
      <td className='price'>
        {bid[0]}
      </td>
      <td className='size'>
      {bid[1]}
        {/* <span style={{'minWidth': percent }} className='percent'>{bid[1]}</span> */}
      </td>
    </tr>
  )
}


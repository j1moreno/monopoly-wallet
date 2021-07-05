import React from 'react'

export default function PasswordPrompt(props) {
  return (
    <div>
      {`Current state is ${props.gameState}`}
      <button onClick={() => {props.gameState = 1}}>Change State</button>
    </div>
  )
}

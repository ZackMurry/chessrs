import React, { useState } from 'react'
import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Chessboard from './board/Chessboard'

function App() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <a href={`http://localhost/api/v1/oauth2/code/lichess`} rel='noreferrer noopener'>
          Login
        </a>
        <Chessboard />
      </DndProvider>
    </>
  )
}

export default App

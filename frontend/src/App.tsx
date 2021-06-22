import React, { useState } from 'react'
import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Chessboard from './board/Chessboard'
import { Box, ChakraProvider, Grid, GridItem, Stack } from '@chakra-ui/react'
import theme from './theme'
import BoardControlsPanel from './BoardControlsPanel'
import ChessJS, { ShortMove } from 'chess.js'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const chess = new Chess()

function App() {
  const [pgn, setPgn] = useState('')
  const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  const handleMove = (move: ShortMove) => {
    chess.move(move)
    setPgn(chess.pgn())
    setCurrentFen(chess.fen())
  }

  const handleBack = () => {
    chess.undo()
    setCurrentFen(chess.fen())
  }

  return (
    <ChakraProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <a href={`http://localhost/api/v1/oauth2/code/lichess`} rel='noreferrer noopener'>
          Login
        </a>
        <Grid
          templateColumns='repeat(12, 1fr)'
          templateRows={{ base: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)', xl: 'repeat(1, 1fr)' }}
          minH='95vh'
          gap={{ base: 0, md: 4 }}
        >
          <GridItem colSpan={{ base: 12, xl: 4 }} rowSpan={1} padding={{ base: '1%', xl: '10%' }}>
            <Box bg='gray.700' w='100%' h='100%' />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 9, xl: 4 }} rowSpan={{ base: 3, md: 4, xl: 1 }}>
            <Chessboard onMove={handleMove} fen={currentFen} />
          </GridItem>
          <GridItem
            colSpan={{ base: 12, md: 3, xl: 4 }}
            rowSpan={{ base: 1, md: 4, xl: 1 }}
            padding={{ base: '1%', lg: '10%' }}
          >
            {/* todo: implement moving forward through the game */}
            <BoardControlsPanel pgn={pgn} onForward={() => console.log('forward')} onBack={handleBack} />
          </GridItem>
        </Grid>
      </DndProvider>
    </ChakraProvider>
  )
}

export default App

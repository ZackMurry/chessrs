import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Chessboard from './board/Chessboard'
import { Box, ChakraProvider, Grid, GridItem } from '@chakra-ui/react'
import theme from './theme'
import BoardControlsPanel from './BoardControlsPanel'
import { Provider } from 'react-redux'
import store from './store'
import AnalysisPanel from './analysis/AnalysisPanel'

function App() {
  return (
    <Provider store={store}>
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
              <AnalysisPanel />
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 9, xl: 4 }} rowSpan={{ base: 3, md: 4, xl: 1 }}>
              <Chessboard />
            </GridItem>
            <GridItem
              colSpan={{ base: 12, md: 3, xl: 4 }}
              rowSpan={{ base: 1, md: 4, xl: 1 }}
              padding={{ base: '1%', lg: '10%' }}
            >
              {/* todo: implement moving forward through the game */}
              <BoardControlsPanel />
            </GridItem>
          </Grid>
        </DndProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App

import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Chessboard from './board/Chessboard'
import { ChakraProvider, Grid, GridItem, Flex, Heading } from '@chakra-ui/react'
import theme from './theme'
import PositionPanel from './PositionPanel'
import { Provider } from 'react-redux'
import store from './store'
import OverviewPanel from './OverviewPanel'

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          <Flex alignItems='center' pl='50px' pt='20px' color='whiteText'>
            <Heading as='h2' fontSize='32px' fontWeight='normal'>
              ChesSRS
            </Heading>
            <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
              <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
                Login
              </a>
            </Heading>
          </Flex>
          <Grid
            templateColumns='repeat(12, 1fr)'
            templateRows={{ base: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)', xl: 'repeat(1, 1fr)' }}
            minH='90vh'
            gap={{ base: 0, md: 4 }}
          >
            <GridItem colSpan={{ base: 12, xl: 3 }} rowSpan={1} padding={{ base: '1%', xl: '5% 10%' }}>
              <OverviewPanel />
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 9, xl: 6 }} rowSpan={{ base: 3, md: 4, xl: 1 }}>
              <Chessboard />
            </GridItem>
            <GridItem
              colSpan={{ base: 12, md: 3, xl: 3 }}
              rowSpan={{ base: 1, md: 4, xl: 1 }}
              padding={{ base: '1%', lg: '5% 10%' }}
            >
              <PositionPanel />
            </GridItem>
          </Grid>
        </DndProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App

import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChakraProvider, Flex, Heading } from '@chakra-ui/react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import theme from 'theme'
import { Provider } from 'react-redux'
import store from 'store/store'
import CreateMovesPage from 'pages/create/CreateMovesPage'
import StudyPage from 'pages/study/StudyPage'

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Flex alignItems='center' pl='50px' pt='20px' color='whiteText'>
              <Heading as='h2' fontSize='32px' fontWeight='normal'>
                ChesSRS
              </Heading>
              <Link to='/create'>
                <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
                  Create
                </Heading>
              </Link>
              <Link to='/study'>
                <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
                  Study
                </Heading>
              </Link>
              <Heading as='h4' fontSize='24px' fontWeight='normal' ml='25px' color='whiteText'>
                <a href='/api/v1/oauth2/code/lichess' rel='noreferrer noopener'>
                  Login
                </a>
              </Heading>
            </Flex>
            <Switch>
              <Route path='/create' exact>
                <CreateMovesPage />
              </Route>
              <Route path='/study' exact>
                <StudyPage />
              </Route>
            </Switch>
          </Router>
        </DndProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App

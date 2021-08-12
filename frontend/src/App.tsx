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
import PracticePage from 'pages/practice/PracticePage'
import AccountManager from 'components/AccountManager'
import Navbar from 'components/Navbar'
import DashboardPage from 'pages/dash/DashboardPage'

// todo: add way to view all of your moves in the database
function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <AccountManager />
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Navbar />
            <Switch>
              <Route path='/' exact>
                <DashboardPage />
              </Route>
              <Route path='/create' exact>
                <CreateMovesPage />
              </Route>
              <Route path='/study' exact>
                <StudyPage />
              </Route>
              <Route path='/practice' exact>
                <PracticePage />
              </Route>
            </Switch>
          </Router>
        </DndProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App

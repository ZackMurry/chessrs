import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import theme from 'theme'
import { Provider } from 'react-redux'
import store from 'store/store'
import CreateMovesPage from 'pages/create/CreateMovesPage'
import StudyPage from 'pages/study/StudyPage'
import PracticePage from 'pages/practice/PracticePage'
import AccountManager from 'components/AccountManager'
import Navbar from 'components/Navbar'
import DashboardPage from 'pages/dash/DashboardPage'
import MovesPage from 'pages/moves/MovesPage'

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
              <Route path='/moves' exact>
                <MovesPage />
              </Route>
            </Switch>
          </Router>
        </DndProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App

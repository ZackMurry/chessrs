import './App.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom'
import theme from 'theme'
import { Theme } from '@radix-ui/themes'
import { Provider } from 'react-redux'
import store from 'store/store'
import CreateMovesPage from 'pages/create/CreateMovesPage'
import StudyPage from 'pages/study/StudyPage'
import PracticePage from 'pages/practice/PracticePage'
import AccountManager from 'components/AccountManager'
import Navbar from 'components/Navbar'
import HomePage from 'pages/home/HomePage'
import RepertoirePage from 'pages/repertoire/RepertoirePage'
import AccountPage from 'pages/account/AccountPage'
import LandingPage from 'pages/landing/LandingPage'
import '@radix-ui/themes/styles.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const showHeader = location.pathname !== '/'

  return (
    <>
      {showHeader && <Navbar />}
      <main>{children}</main>
    </>
  )
}

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Theme appearance='dark'>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <AccountManager />
              <Layout>
                <Switch>
                  <Route path='/' exact>
                    <LandingPage />
                  </Route>
                  <Route path='/home' exact>
                    <HomePage />
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
                  <Route path='/repertoire' exact>
                    <RepertoirePage />
                  </Route>
                  <Route path='/account' exact>
                    <AccountPage />
                  </Route>
                </Switch>
              </Layout>
            </Router>
          </DndProvider>
        </Theme>
      </ChakraProvider>
    </Provider>
  )
}

export default App

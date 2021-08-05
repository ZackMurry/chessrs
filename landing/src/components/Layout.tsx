import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../../../frontend/src/theme'

const Layout: React.FC = ({ children }) => <ChakraProvider theme={theme}>{children}</ChakraProvider>

export default Layout

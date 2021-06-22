import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  }
})

export default theme

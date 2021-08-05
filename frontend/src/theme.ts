import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    bg: '#181a1b',
    surface: '#202424',
    surfaceBorder: '#323638',
    whiteText: '#e8e6e3',
    btnBg: '#242728',
    btnBorder: '#454442',
    elevated: '#2e3133',
    error: '#b73331',
    grayBtn: '#767a7c'
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#181a1b'
      }
    }
  },
  fonts: {
    heading: "'Noto Sans', Sans-Serif",
    body: "'Noto Sans', Sans-Serif"
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  }
})

export default theme

export const TOAST_DURATION = 5000

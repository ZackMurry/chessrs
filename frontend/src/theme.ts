import { extendTheme, ThemeOverride } from '@chakra-ui/react'

const config: ThemeOverride = {
  colors: {
    bg: '#181a1b',
    surface: '#202424',
    surfaceBorder: '#323638',
    whiteText: '#e8e6e3',
    btnBg: '#242728',
    btnBorder: '#454442',
    elevated: '#2e3133',
    error: '#b73331',
    success: '#2e7d28',
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
}

// Needed for the table on /moves
config.colors = {
  ...config.colors,
  chessrs: {
    700: config.colors.surface
  }
}

const theme = extendTheme(config)

export default theme

export const TOAST_DURATION = 5000

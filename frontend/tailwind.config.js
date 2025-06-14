/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        redhat: ['"Red Hat Display"', 'sans-serif']
      },
      colors: {
        offwhite: {
          DEFAULT: '#e8e6e3'
        },
        surface: {
          DEFAULT: '#202424'
        },
        surfaceBorder: {
          DEFAULT: '#323638'
        }
      }
    }
  },
  plugins: []
}

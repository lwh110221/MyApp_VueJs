/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'highland': {
          50: '#f0f9f0',
          100: '#dcf1dc',
          200: '#bbe3bd',
          300: '#8ecd92',
          400: '#5db264',
          500: '#3c9941',
          600: '#2c7b32',
          700: '#25612a',
          800: '#214d25',
          900: '#1c3f20',
          950: '#0e2411',
        },
        'crop': {
          50: '#fefae7',
          100: '#fcf4c3',
          200: '#fae886',
          300: '#f7d649',
          400: '#f4c41d',
          500: '#e2ab10',
          600: '#c6880c',
          700: '#a0650e',
          800: '#855112',
          900: '#6f4314',
          950: '#412408',
        },
        'soil': {
          50: '#f8f4ee',
          100: '#eee4d5',
          200: '#dfc8ad',
          300: '#cda77d',
          400: '#c08c57',
          500: '#b17743',
          600: '#995f38',
          700: '#7b4a2f',
          800: '#673e2a',
          900: '#593826',
          950: '#301b13',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'highland': '0 4px 14px 0 rgba(60, 153, 65, 0.2)',
      },
      backgroundImage: {
        'highland-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}


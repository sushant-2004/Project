/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        surface: '#121938',
        primary: {
          DEFAULT: '#635bff',
          600: '#5146ff',
          700: '#3c2eff',
        },
        accent: '#00d4ff',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(99,91,255,0.25)'
      },
      borderRadius: {
        xl: '1rem'
      }
    },
  },
  plugins: [],
}

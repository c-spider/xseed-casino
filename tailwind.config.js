/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#be0c6a',
      },
      fontFamily: {
        'ibm': ['IBM Plex Sans', 'sans-serif'],
        'impact' : ['Impact', 'Haettenschweiler', 'Franklin Gothic Bold', 'Charcoal', 'sans-serif']
      },
      zIndex: {
        '45': '45',
        '100': '100',
      }
    },
  },
  plugins: [],
}
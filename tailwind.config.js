/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'sans-serif'],
      },
      colors: {
        darkbg: '#0a0a0a',
        lightbg: '#eeeeee',
        // Soft warm yellow / amber accent palette
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          glow: 'rgba(234, 179, 8, 0.35)'
        }
      },
      boxShadow: {
        'glow': '0 0 25px rgba(234, 179, 8, 0.35)',
        'glow-lg': '0 0 45px rgba(234, 179, 8, 0.5)',
      }
    },
  },
  plugins: [],
}

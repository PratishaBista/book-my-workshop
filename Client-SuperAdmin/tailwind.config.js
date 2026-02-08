/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'super-dark': '#0d0614',
        'super-purple': '#1a0b2e',
        'super-border': '#2a1b3d',
      }
    },
  },
  plugins: [],
}

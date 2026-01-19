export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          base: "#FAF8E7",
          offwhite: "#FFFDEC",
        },
        neutral: {
          white: "#F9F9F5",
        },
        primary: {
          orange: "#EE7932",
          green: "#73A757",
        },
        deep: {
          purple: "#1A0B2E",
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      }
    },
  },
  plugins: [],
}
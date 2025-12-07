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
        },
        neutral: {
          white: "#F9F9F5",
        },
        primary: {
          orange: "#EE7932",
        },
        deep: {
          purple: "#1A0B2E", // Rich dark purple for logo/anchors
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      poppins: "Poppins",
    },
    extend: {
      backgroundImage: {
        background: "url('../public/images/bg.png')",
        backgroundDark: "url('../public/images/backgrouddark.png')",
        backgroundAuth: "url('../public/images/authbg.png')",
      },
      keyframes: {
        scroll: {
          to: { transform: "translate(calc(-50% - 2.5rem))" },
        },
      },
      animation: {
        carousel: "scroll 25s forwards linear infinite",
      },
      boxShadow: {
        custom:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1), -4px 4px 6px rgba(0, 0, 0, 0.1), 4px 4px 6px rgba(0, 0, 0, 0.1)",
      },

      darkMode: "class",
      colors: {
        whiteColor: "#ffffff",
        blueColor: "#042EFE",
        lightblueColor: "#048EFE",
        primaryColor: "#242424",
        pink: "#A800CA",
        cgreen: "#17A2B8",
        gray: "#C7C7C7",
        gray1: "#CBCBCB",
        grayColor: "#B3B3B3",
        gray2: "#F4F4F4",
        gray3: "#BBBBBB",
      },
      screens: {
        xl: "1240px",
        xxl: "1004px",
        xxl2: "1028px",
        xlarge: "1440px",
      },
    },
  },
  plugins: [],
};

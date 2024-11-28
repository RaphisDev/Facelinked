/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#f4f4f4",
        accent: "#285FF5",
        text: "#222427",
        secText: "#828282",

        //dark mode
        dark:{
          primary: "#2a313c", //maybe this: #353843, (look at Docs Folder)
          accent: "#285FF5", //or this: #27ae60
          text: "#FEFEFE",
          secText: "#828282"
        }
      }
    },
  },
  plugins: [],
}


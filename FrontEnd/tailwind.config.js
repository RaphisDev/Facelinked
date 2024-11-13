/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FEFEFE",
        accent: "#27ae60",
        text: "#222427",
        secText: "#828282",

        //dark mode
        dark:{
          primary: "#2a313c", //maybe this: #353843, (look at Docs Folder)
          accent: "#27ae60", //maybe: #0210ae, #050533, #0519c0
          text: "#FEFEFE",
          secText: "#828282"
        }
      }
    },
  },
  plugins: [],
}


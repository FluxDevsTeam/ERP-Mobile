/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add "./app/**/*.{js,jsx,ts,tsx}" to the content array
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: '#C85A32',
        indigo: '#2C3E50',
        ivory: '#FAF7F2',
        brown: '#5C5047',
      },
    },
  },
  plugins: [],
}

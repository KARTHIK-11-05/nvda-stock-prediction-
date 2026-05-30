/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#080B11",
        darkCard: "#0F172A",
        accentNeon: "#00F2FE",
        accentGreen: "#10B981",
        accentPurple: "#8B5CF6",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

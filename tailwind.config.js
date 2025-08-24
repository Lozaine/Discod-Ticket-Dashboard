/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'discord-blue': '#5865F2',
        'discord-green': '#57F287',
        'discord-red': '#ED4245',
        'discord-yellow': '#FEE75C',
        'discord-blurple': '#7289DA',
        'discord-dark': '#2C2F33',
        'discord-darker': '#23272A',
      },
    },
  },
  plugins: [],
}
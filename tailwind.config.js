/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'glowdex-green': '#0a5c47',
        'glowdex-teal': '#1d9e75',
      },
    },
  },
  plugins: [],
};

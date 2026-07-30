/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  safelist: [
    // MBCAM brand greens — used in progress bars and UI accents.
    // Safelisted because they are constructed dynamically in
    // StatisticalDetailToggle.tsx and would otherwise be purged.
    'bg-glowdex-green', // #0a5c47 — dark teal, high/positive indicators
    'bg-glowdex-teal', // #1d9e75 — mid teal, pressure relief indicators

    // Standard Tailwind semantic colors — safelisted for the same reason.
    'bg-amber-500', // warning — mid-range or typical values
    'bg-red-500', // danger — low ecological or high stress indicators

    // Section and footer backgrounds in StatisticalDetailToggle
    'bg-gray-50', // light mode section header and footer shade
  ],
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

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"], // Poppins from next/font
        dragracing: ["DragRacing", "sans-serif"],   // Local font
      },
    },
  },
  plugins: [],
  safelist: [
      { pattern: /track-[1-6]/ },
    { pattern: /\[data-id="track-\d+"\]/ },
  ],
};


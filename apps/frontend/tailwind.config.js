/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        accent: {
          50: '#eef4ff',
          100: '#d9e8ff',
          200: '#bfd8ff',
          300: '#91bcff',
          400: '#5d94ff',
          500: '#3f6fff',
          600: '#2f52ff',
          700: '#2942eb',
          800: '#2738be',
          900: '#26358f',
        },
      },
      boxShadow: {
        glass: '0 8px 36px rgba(31, 38, 135, 0.22)',
        neo: '10px 10px 30px rgba(15, 23, 42, 0.22), -10px -10px 30px rgba(255, 255, 255, 0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(63, 111, 255, 0)' },
          '50%': { boxShadow: '0 0 25px rgba(63, 111, 255, 0.65)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        glow: 'glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Aduanas Chile
        aduana: {
          50:  '#e6eef6',
          100: '#ccdded',
          200: '#99bbda',
          300: '#6699c8',
          400: '#3377b5',
          500: '#0055a3',   // Azul institucional principal
          600: '#003f8a',   // Azul oscuro logo
          700: '#002d6b',
          800: '#001e4d',
          900: '#000f2e',
        },
        aduana_rojo: {
          DEFAULT: '#cc0000',
          dark:    '#990000',
        },
        aduana_gris: {
          light:   '#f5f6f8',
          DEFAULT: '#e8eaed',
          medium:  '#9aa0ac',
          dark:    '#3c4049',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,63,138,0.10)',
        'card-hover': '0 6px 20px rgba(0,63,138,0.18)',
      },
    },
  },
  plugins: [],
};

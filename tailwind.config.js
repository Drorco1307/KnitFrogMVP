/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4299E1',
          dark: '#2B6CB0',
        },
        success: '#48BB78',
        warning: '#ECC94B',
        error: '#F56565',
        background: '#F7FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#2D3748',
          secondary: '#718096',
        },
        stitch: {
          knit: '#E6F3FF',
          purl: '#FFF5E6',
          cable: '#FFE6F0',
          decrease: '#FFE6E6',
          increase: '#E6FFE6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}

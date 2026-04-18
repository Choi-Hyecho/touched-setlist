import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'touched-primary': '#E62D2D',
        'touched-light':   '#F05A5A',
        'touched-neon':    '#ff3d8a',
        'touched-glow':    '#ff6bcb',
        surface:  '#181818',
        elevated: '#282828',
        muted:    '#a7a7a7',
      },
      fontFamily: {
        sans:    ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':  'fadeIn 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
      },
    },
  },
  plugins: [forms],
};

export default config;

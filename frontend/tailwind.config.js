/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暗色主题颜色
        dark: {
          bg: {
            base: '#050505',
            primary: '#0A0A0A',
            secondary: '#121212',
            surface: '#141414',
            elevated: '#1A1A1A',
            deep: '#0F0F0F',
            sunken: '#080808',
            hover: '#27272a',
          },
          border: {
            primary: '#27272a',
            secondary: '#3f3f46',
            subtle: '#18181b',
          },
          text: {
            primary: '#ffffff',
            secondary: '#d4d4d8',
            tertiary: '#a1a1aa',
            muted: '#71717a',
          },
        },
        // 亮色主题颜色
        light: {
          bg: {
            base: '#F7F5F0',
            primary: '#FFFFFF',
            secondary: '#FAF9F7',
            surface: '#FFFFFF',
            elevated: '#F5F3EE',
            deep: '#F0EDE8',
            sunken: '#F9F7F4',
            hover: '#E5E0DA',
          },
          border: {
            primary: '#E5E0DA',
            secondary: '#D1CDC6',
            subtle: '#EDE9E3',
          },
          text: {
            primary: '#1A1816',
            secondary: '#44413D',
            tertiary: '#6B6862',
            muted: '#8A8680',
          },
        },
        // 强调色
        accent: {
          DEFAULT: '#818cf8',
          hover: '#6366f1',
          muted: '#6366f1',
          light: '#a5b4fc',
          dark: '#4f46e5',
        },
        // 状态色
        success: {
          DEFAULT: '#34d399',
          text: '#6ee7b7',
          bg: 'rgba(52, 211, 153, 0.1)',
        },
        error: {
          DEFAULT: '#f87171',
          text: '#fca5a5',
          bg: 'rgba(248, 113, 113, 0.1)',
        },
        warning: {
          DEFAULT: '#fbbf24',
          text: '#fcd34d',
          bg: 'rgba(251, 191, 36, 0.1)',
        },
        info: {
          DEFAULT: '#60a5fa',
          text: '#93c5fd',
          bg: 'rgba(96, 165, 250, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 15px rgba(0, 0, 0, 0.1)',
        'strong': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 15px rgba(129, 140, 248, 0.3)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
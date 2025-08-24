module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6', // blue-500
          DEFAULT: '#6366F1', // indigo-500
          dark: '#8B5CF6', // purple-500
        },
        risk: {
          low: '#10B981', // green-500
          medium: '#F59E0B', // amber-500
          high: '#EF4444', // red-500
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      boxShadow: {
        'xl': '0 10px 32px 0 rgba(59, 130, 246, 0.10)',
        '2xl': '0 16px 48px 0 rgba(59, 130, 246, 0.15)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-40px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'pulse-button': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.4)' },
          '50%': { boxShadow: '0 0 0 16px rgba(59,130,246,0)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 12s ease-in-out infinite',
        'float-slow-reverse': 'float-slow-reverse 10s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 4s infinite',
        'scale-in': 'scale-in 1s cubic-bezier(0.4,0,0.2,1) both',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.4,0,0.2,1) both',
        'slide-down': 'slide-down 0.8s cubic-bezier(0.4,0,0.2,1) both',
        'pulse-button': 'pulse-button 2s cubic-bezier(0.4,0,0.2,1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode - Minimal Monochrome Palette
        background: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          amber: '#F59E0B',
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        // Dark Mode
        dark: {
          background: '#1F2937',
          surface: '#374151',
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
            muted: '#9CA3AF',
          },
          border: '#4B5563',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config

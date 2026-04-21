import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          300: '#F59542',
          400: '#F07B2E',
          500: '#E8651A',
          600: '#D4520F',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        figtree: {
          red: '#C8102E',
          dark: '#8A0B1F',
          light: '#FDF2F4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
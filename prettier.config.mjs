export default {
  trailingComma: 'all',
  printWidth: 100,
  overrides: [
    {
      files: ['apps/backend/**/*.{ts,mts,cts,js,mjs}', 'packages/**/*.{ts,tsx,js,mjs}'],
      options: {
        semi: true,
        singleQuote: true,
      },
    },
    {
      files: ['apps/web/**/*.{ts,tsx,js,mjs,css}'],
      options: {
        semi: true,
        singleQuote: true,
      },
    },
  ],
};

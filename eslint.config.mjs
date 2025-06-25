export default [{
  files: ['src/**/*.ts'],
  languageOptions: {
    parser: (await import('@typescript-eslint/parser')).default,
  },
  plugins: {
    '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
  },
  rules: {
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
  },
}]
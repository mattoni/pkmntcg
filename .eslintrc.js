module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  env: {
    node: true,
    commonjs: true,
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // For some reason, these are popping errors up even when types are strictly defined
    // '@typescript-eslint/no-unsafe-assignment': 0,
    // '@typescript-eslint/no-unsafe-return': 0,
    // '@typescript-eslint/no-unsafe-member-access': 0,
    // '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {varsIgnorePattern: '^_', argsIgnorePattern: '^_'},
    ],
  },
}

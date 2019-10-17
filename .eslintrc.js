module.exports = {
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./src/tsconfig.json', './src/spec/_tsconfig.json'],
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', '@typescript-eslint/tslint'],
  rules: {
    '@typescript-eslint/class-name-casing': 'error',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': 'error',
    '@typescript-eslint/no-empty-function': 'error',
    curly: 'error',
    'dot-notation': 'error',
    'no-caller': 'error',
    'no-console': [
      'error',
      {
        allow: ['debug', 'info', 'time', 'timeEnd', 'trace']
      }
    ],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-debugger': 'error',
    'no-empty': 'error',
    'no-eval': 'error',
    'no-fallthrough': 'error',
    'no-new-wrappers': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    radix: 'error',
    'max-len': ['error', { code: 140 }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': ['error'],
    eqeqeq: ['error', 'smart'],
    'no-irregular-whitespace': 'error',
    'brace-style': ['error', '1tbs'],
    'no-unused-expressions': ['error', { allowTernary: true }],
    'keyword-spacing': 'error',
    '@typescript-eslint/tslint/config': [
      'error',
      {
        rulesDirectory: ['./tslint/rules'],
        rules: {
          'jsdoc-format': true,
          'underscore-prefix': true
        }
      }
    ]
  }
};

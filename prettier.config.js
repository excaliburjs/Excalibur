// .prettierrc.js
module.exports = {
  printWidth: 140,
  singleQuote: true,
  trailingComma: 'none',
  arrowParens: 'always',
  overrides: [
    {
      files: ['./src/*', './sandbox/src/*', './sandbox/tests/*']
    }
  ]
};

// @ts-check
import jsdoc from 'eslint-plugin-jsdoc';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  globalIgnores([
    'site',
    'sandbox',
    'scripts',
    '**/karma.conf.*',
    '**/webpack.config.js',
    '**/webpack.config.prod.js',
    '**/wallaby.js',
    '**/version.js',
    '**/vite.config.common.js',
    '**/node_modules',
    '**/build',
    '**/coverage',
    '**/node_cache',
    '**/*.d.ts',
    '**/build-storybook'
  ]),
  tseslint.configs.base,
  {
    plugins: {
      jsdoc
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },

      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'memberLike',
          modifiers: ['private', 'static'],
          format: ['UPPER_CASE'],
          leadingUnderscore: 'require'
        },
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'require'
        },
        {
          selector: 'interface',
          format: ['PascalCase'],

          custom: {
            regex: '^I[A-Z]',
            match: false
          }
        }
      ],

      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      curly: 'error',
      'dot-notation': 'error',
      'no-caller': 'error',

      'no-console': [
        'error',
        {
          allow: ['debug', 'info', 'time', 'timeEnd', 'trace']
        }
      ],

      'no-debugger': 'error',
      'no-empty': 'error',
      'no-eval': 'error',
      'no-fallthrough': 'error',
      'no-new-wrappers': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'require-await': 'warn',
      radix: 'error',
      eqeqeq: ['error', 'smart'],
      'no-irregular-whitespace': 'error',
      'brace-style': ['error', '1tbs'],

      'no-unused-expressions': [
        'error',
        {
          allowTernary: true
        }
      ],

      'no-restricted-syntax': [
        'error',
        {
          message: "Do not commit tests with 'fit'",
          selector: "CallExpression[callee.name='fit'] > Identifier"
        }
      ],

      'jsdoc/require-param': 0,
      'jsdoc/require-param-description': 0,
      'jsdoc/require-param-type': 0,
      'jsdoc/require-returns': 0,
      'jsdoc/require-returns-type': 0,
      'jsdoc/newline-after-description': 0,
      'jsdoc/no-multi-asterisks': 0,

      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['hidden', 'internal', 'source', 'obsolete', 'warning', 'notimplemented', 'credit', 'typedoc']
        }
      ]
    }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: false
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: true
      }
    }
  }
);

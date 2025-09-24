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
    'docs/api/**',
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
  tseslint.configs.recommendedTypeChecked,
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

      // these are new rules introduced when upgrading typescript-eslint to 9, we may want to enable and fix some of these
      // some of these are only affecting test files, maybe we just want to disable some of these only in test files
      // (see ruleset below)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',

      // these are ones we should probably enable & fix, and/or move to test files ruleset
      'prefer-spread': 'off',
      'prefer-rest-params': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-wrapper-object-type': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/await-thenable': 'off',

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
  // lax ruleset for tests and stories
  {
    files: ['**/*Spec*', '**/*.stories*'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off'
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

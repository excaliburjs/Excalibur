module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/class-name-casing": "error",
        "@typescript-eslint/indent": ["error", 2],
        "@typescript-eslint/interface-name-prefix": "error",
        "@typescript-eslint/no-empty-function": "error",
        "curly": "error",
        "dot-notation": "error",
        "no-caller": "error",
        "no-console": [
            "error",
            {
                "allow": [
                    "debug",
                    "info",
                    "time",
                    "timeEnd",
                    "trace"
                ]
            }
        ],
        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-new-wrappers": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "prefer-const": "error",
        "radix": "error",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rulesDirectory": [
                    "C:\\Users\\Erik\\Projects\\Excalibur\\tslint\\rules"
                ],
                "rules": {
                    "jsdoc-format": true,
                    "max-line-length": [
                        true,
                        140
                    ],
                    "no-duplicate-variable": true,
                    "no-unused-expression": true,
                    "one-line": [
                        true,
                        "check-open-brace",
                        "check-catch",
                        "check-else",
                        "check-whitespace"
                    ],
                    "quotemark": [
                        true,
                        "single"
                    ],
                    "semicolon": [
                        true,
                        "always",
                        "ignore-bound-class-methods"
                    ],
                    "trailing-comma": [
                        true,
                        {
                            "multiline": "never",
                            "single": "never"
                        }
                    ],
                    "triple-equals": [
                        true,
                        "allow-null-check"
                    ],
                    "underscore-prefix": true,
                    "whitespace": [
                        true,
                        "check-branch",
                        "check-decl",
                        "check-operator",
                        "check-separator",
                        "check-type"
                    ]
                }
            }
        ]
    }
};

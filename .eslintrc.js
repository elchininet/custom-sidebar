module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint',
        '@stylistic/eslint-plugin-js'
    ],
    rules: {
        quotes: [
            'error',
            'single',
            {
                avoidEscape: true,
                allowTemplateLiterals: true
            }
        ],
        indent: ['error', 4],
        semi: ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'no-trailing-spaces': ['error'],
        'array-bracket-spacing': ['error', 'never'],
        'comma-spacing': ['error'],
        '@typescript-eslint/no-duplicate-enum-values': 'off'
    }
};

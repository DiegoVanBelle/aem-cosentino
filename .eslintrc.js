module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  overrides: [
    {
      files: ['react/**/*.mjs', 'react/**/*.jsx', 'test/**/*.mjs'],
      env: { node: true, es2022: true },
      parserOptions: { babelOptions: { plugins: ['@babel/plugin-syntax-jsx'] } },
      rules: {
        'import/extensions': ['error', 'always', { ignorePackages: true }],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/prefer-default-export': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
        'max-len': ['error', { code: 180 }],
        'no-underscore-dangle': 'off',
        'no-unused-vars': ['error', { varsIgnorePattern: '^Component$', argsIgnorePattern: '^Component$' }],
        'no-console': 'off',
        'no-promise-executor-return': 'off',
      },
    },
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
};

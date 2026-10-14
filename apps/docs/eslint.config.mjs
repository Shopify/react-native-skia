import reactNativeWcandillon from 'eslint-config-react-native-wcandillon';

export default [
  ...reactNativeWcandillon,
  {
    ignores: ['node_modules/**', 'build/**', '.docusaurus/**'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'prefer-destructuring': [
        'error',
        {
          object: true,
          array: false,
        },
      ],
      'no-bitwise': 'off',
      'no-var': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];
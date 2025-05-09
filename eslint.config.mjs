import { compat } from '@eslint/eslintrc';

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    }
  }
];

export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "off", // Disables the base ESLint rule
      "@typescript-eslint/no-unused-vars": "off", // Disables the TypeScript-specific rule
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "off"
    },
  },
];

export default eslintConfig;

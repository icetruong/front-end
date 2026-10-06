import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  { ignores: ["dist/", "node_modules/"] }, // 1. bỏ qua thư mục build
  js.configs.recommended, // 2. rule JS cơ bản
  tseslint.configs.recommended, // 3. PHẦN CHÍNH cho TS: parser + rule TS
  {
    files: ["**/*.ts"],
    languageOptions: { globals: globals.browser },
    rules: {
      // tuỳ chỉnh cá nhân — PHẢI đặt SAU tseslint thì mới ghi đè được
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintConfigPrettier, // 4. LUÔN đặt CUỐI CÙNG
]);

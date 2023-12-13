import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { resolve } from "path";

export default defineConfig({
  input: resolve(__dirname, "src/index.ts"),
  output: {
    dir: resolve(__dirname, "dist"),
    preserveModules: true,
  },
  plugins: [
    ts({
      declaration: true,
      declarationDir: resolve(__dirname, "dist/types"),
      rootDir: "src"
    })
  ],
});

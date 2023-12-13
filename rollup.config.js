import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    preserveModules: true,
    entryFileNames: "[name].js"
  },
  plugins: [
    ts({
      declaration: true,
      declarationDir: "dist/types",
      rootDir: "src"
    })
  ],
});

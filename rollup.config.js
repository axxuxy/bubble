import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { resolve, relative } from "path";

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    preserveModules: true,
    entryFileNames(_) {
      const path = relative(__dirname, resolve(__dirname, _.name + ".js"));
      console.log(path);
      return path;
    }
  },
  plugins: [
    ts({
      declaration: true,
      declarationDir: "dist/types",
      rootDir: "src"
    })
  ],
});

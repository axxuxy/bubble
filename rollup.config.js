import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { resolve, relative } from "path";

export default defineConfig({
  input: "src/index.ts",
  output: {
    dir: "dist",
    preserveModules: true,
    entryFileNames(_) {
      const __ = _.name.split("/");
      for (let index = 0; index < __.length; index++) {
        if (__[index] !== "..") {
          __.splice(0, index * 2);
          continue;
        }
      }
      _.name = __.join("/") + ".js";
      return __.join("/") + ".js";
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

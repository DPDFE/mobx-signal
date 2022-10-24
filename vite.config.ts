import react from "@vitejs/plugin-react";
import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const entry = resolve(__dirname, "./src/signal.tsx");

// 所有顶部的import都不要打包到最终结果里面
const src = fs.readFileSync(entry).toString();
const re = /^import\s+.*?\s+from\s+['"]([^.]+)['"]/;
const externals = [];
src.split("\n").forEach(function (line) {
  const result = line.match(re);
  if (result?.[1]) {
    externals.push(result[1]);
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ jsxRuntime: "classic" }),
    dts({ exclude: "vite-env.d.ts" }),
  ],
  build: {
    minify: false,
    lib: {
      entry,
      name: "signal",
      fileName: "signal",
      formats: ["es"],
    },
    rollupOptions: {
      external: externals,
    },
  },
});

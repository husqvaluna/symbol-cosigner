import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      "symbol-crypto-wasm-node": "symbol-crypto-wasm-web/symbol_crypto_wasm.js",
    },
  },
  build: {
    chunkSizeWarningLimit: 4000,
  },
  plugins: [
    nodePolyfills({
      include: ["crypto"],
      globals: {
        Buffer: true,
      },
    }),
    topLevelAwait(),
    wasm(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    open: true,
  },
});

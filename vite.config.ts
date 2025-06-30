import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Symbol Cosigner",
        short_name: "Symbol Cosigner",
        description: "Cosigning Management Tool.",
        theme_color: "#1e40af",
        background_color: "#f9fafb",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        screenshots: [
          {
            src: "screenshot-wide.jpg",
            sizes: "1280x720",
            type: "image/jpeg",
            form_factor: "wide",
          },
        ],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    open: true,
  },
});

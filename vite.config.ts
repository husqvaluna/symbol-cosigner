import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

import { VitePWA } from "vite-plugin-pwa";

const cacheId = "symbol-cosigner";

export default defineConfig({
  resolve: {
    alias: {
      "symbol-crypto-wasm-node": "symbol-crypto-wasm-web/symbol_crypto_wasm.js",
    },
  },
  build: {
    chunkSizeWarningLimit: 4096,
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
      // injectRegister: "auto",
      //includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      includeAssets: ["**/*"],
      workbox: {
        cacheId,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 100,
        globPatterns: ["**/*.{html,js,css,ico,jpg,png,gif,svg,webp,mp4,mp3,webmanifest,wasm}"],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          // {
          //   urlPattern: ({ request }) => request.mode === "navigate",
          //   handler: "NetworkFirst",
          //   options: {
          //     cacheName: "pages-cache",
          //     networkTimeoutSeconds: 3,
          //     expiration: {
          //       maxEntries: 10,
          //       maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
          //     },
          //   },
          // },
          // {
          //   urlPattern: /\.(?:js|css|woff2?|wasm)$/i,
          //   handler: "CacheFirst",
          //   options: {
          //     cacheName: "static-assets-cache",
          //     expiration: {
          //       maxEntries: 100,
          //       maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
          //     },
          //   },
          // },
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
            src: "maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    open: true,
  },
});

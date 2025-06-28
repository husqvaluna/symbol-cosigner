# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 日本語で回答して下さい。
- 絵文字は使用禁止。
- ユーザーからの指示や仕様に疑問などがあれば作業を中断し、質問すること。
- コードエクセレンス原則に基づきテスト駆動開発を必須で実施すること。
- TDDおよびテスト駆動開発で実践する際は、全てt-wadaの推奨する進め方に従ってください。
- リファクタリングはMartin Fowlerが推奨する進め方に従って下さい。
- セキュリティルールに従うこと。
- 強制追加など-fコマンドは禁止。
- 適切なタイミングでコミットを実行すること (コミットルール参照)。
- 計画内容、進捗状況は planフォルダを確認すること。

## Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

## Project Overview

This is a Symbol blockchain cosigner application built with React Router v7 and TypeScript. The application provides a web interface for cryptographic signing operations using the Symbol blockchain SDK, specifically for cosigning aggregate transactions.

## Architecture

- **Frontend Framework**: React Router v7 with TypeScript, configured in SPA mode (SSR disabled)
- **Styling**: TailwindCSS v4 with modern styling architecture
- **Symbol Integration**: Uses `symbol-sdk` v3.2.3 and `symbol-crypto-wasm-web` for blockchain operations
- **Build Tool**: Vite with specialized plugins for Symbol/crypto compatibility:
  - Node polyfills for crypto operations
  - WASM support for Symbol cryptographic functions
  - Top-level await support
  - Browser crypto compatibility layer

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Code linting/formatting (Biome)
npx biome check
npx biome format --write
```

## Symbol Blockchain Integration

### Key Components

- **Cryptographic Operations**: Located in `app/components/misc/symbol-sign-test.tsx` - demonstrates transaction signing
- **Example Cosigning**: Reference implementation in `docs/examples/cosign.ts` shows aggregate transaction cosigning workflow
- **Network Configuration**: Preset servers for TESTNET and MAINNET in `docs/preset-servers.json`

### Important Technical Details

- Vite configuration includes alias mapping `symbol-crypto-wasm-node` → `symbol-crypto-wasm-web` for browser compatibility
- Node polyfills enabled for Buffer and crypto modules to support Symbol SDK in browser
- Chunk size limit increased to 4000KB to accommodate Symbol SDK bundle size

## File Structure

```
app/
├── components/misc/symbol-sign-test.tsx  # Symbol transaction signing demo
├── routes/home.tsx                       # Main application route
├── routes.ts                             # Route configuration
└── root.tsx                             # Root component

docs/
├── examples/cosign.ts                   # Cosigning implementation example
├── openapi-symbol.yml                   # Symbol REST API specification
└── preset-servers.json                  # Network node endpoints
```

## Development Notes

- Application runs in SPA mode (`ssr: false` in react-router.config.ts)
- Development server opens browser automatically
- Symbol SDK requires specific Vite plugins for proper browser compatibility
- Private keys in examples are for demonstration purposes only

## Symbol Network Integration

The application integrates with Symbol blockchain networks:
- TESTNET: Multiple test nodes available for development
- MAINNET: Production network nodes for live transactions

Cosigning workflow involves creating cosignature payloads and submitting them to Symbol network REST endpoints.

/**
 * Symbol SDK署名ユーティリティ
 *
 * 設計方針:
 * - ブラウザ環境でのSymbol SDK使用
 * - セキュアな秘密鍵処理
 * - ネットワーク検証
 * - エラーハンドリング
 *
 * 関連ファイル:
 * - docs/examples/cosign.ts
 * - app/types/transaction.ts
 * - app/store/nodes.ts
 */

import { Hash256, PrivateKey, PublicKey, utils } from "symbol-sdk";
import { Network, SymbolFacade } from "symbol-sdk/symbol";
import type { NetworkType } from "../types/node";

// ===== 型定義 =====

/**
 * 署名結果
 */
export interface SignResult {
  success: boolean;
  cosignature?: {
    parentHash: string;
    signature: string;
    signerPublicKey: string;
    version: string;
  };
  error?: string;
}

/**
 * 署名パラメータ
 */
export interface SignTransactionParams {
  /** 秘密鍵（64文字16進数） */
  privateKey: string;
  /** トランザクションハッシュ（64文字16進数） */
  transactionHash: string;
  /** ネットワークタイプ */
  network: NetworkType;
}

// ===== ユーティリティ関数 =====

/**
 * ネットワークタイプをSymbol SDK NetworkEnumに変換
 */
function getSymbolNetwork(networkType: NetworkType): Network {
  switch (networkType) {
    case "TESTNET":
      return Network.TESTNET;
    case "MAINNET":
      return Network.MAINNET;
    default:
      throw new Error(`未対応のネットワークタイプです: ${networkType}`);
  }
}

/**
 * 秘密鍵形式を検証
 */
function validatePrivateKey(privateKey: string): boolean {
  try {
    // 長さと16進数形式をチェック
    if (privateKey.length !== 64 || !/^[0-9A-Fa-f]{64}$/.test(privateKey)) {
      return false;
    }

    // Symbol SDK で検証
    new PrivateKey(privateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * トランザクションハッシュ形式を検証
 */
function validateTransactionHash(hash: string): boolean {
  try {
    // 長さと16進数形式をチェック
    if (hash.length !== 64 || !/^[0-9A-Fa-f]{64}$/.test(hash)) {
      return false;
    }

    // Symbol SDK で検証
    utils.hexToUint8(hash);
    return true;
  } catch {
    return false;
  }
}

/**
 * 秘密鍵文字列を安全にクリア
 */
function clearPrivateKey(privateKey: string): void {
  // JavaScriptでは文字列はimmutableなので、
  // 変数を無効な値で上書きしてGCに委ねる
  privateKey = "";
}

// ===== メイン関数 =====

/**
 * トランザクションに連署する
 */
export async function signTransaction(
  params: SignTransactionParams,
): Promise<SignResult> {
  let privateKeyString = params.privateKey;

  try {
    // パラメータ検証
    if (!validatePrivateKey(privateKeyString)) {
      return {
        success: false,
        error: "無効な秘密鍵形式です。64文字の16進数で入力してください。",
      };
    }

    if (!validateTransactionHash(params.transactionHash)) {
      return {
        success: false,
        error: "無効なトランザクションハッシュ形式です。",
      };
    }

    // Symbol SDK初期化
    const network = getSymbolNetwork(params.network);
    const facade = new SymbolFacade(network);

    // アカウント作成
    const privateKey = new PrivateKey(privateKeyString);
    const account = facade.createAccount(privateKey);

    // トランザクションハッシュ作成
    const transactionHash = new Hash256(
      utils.hexToUint8(params.transactionHash),
    );

    // 連署作成
    const cosignature = account.cosignTransactionHash(transactionHash, true);
    const cosignatureJson = cosignature.toJson() as {
      parentHash: string;
      signature: string;
      signerPublicKey: string;
      version: string;
    };

    // 秘密鍵を即座にクリア
    clearPrivateKey(privateKeyString);
    privateKeyString = "";

    return {
      success: true,
      cosignature: {
        parentHash: cosignatureJson.parentHash,
        signature: cosignatureJson.signature,
        signerPublicKey: cosignatureJson.signerPublicKey,
        version: cosignatureJson.version,
      },
    };
  } catch (error) {
    // エラー時も秘密鍵をクリア
    clearPrivateKey(privateKeyString);
    privateKeyString = "";

    if (error instanceof Error) {
      // Symbol SDKエラーの詳細な処理
      if (error.message.includes("private key")) {
        return {
          success: false,
          error: "秘密鍵が無効です。正しい形式で入力してください。",
        };
      }

      if (error.message.includes("hash")) {
        return {
          success: false,
          error: "トランザクションハッシュが無効です。",
        };
      }

      if (error.message.includes("network")) {
        return {
          success: false,
          error: "ネットワーク設定が無効です。",
        };
      }

      return {
        success: false,
        error: `署名処理中にエラーが発生しました: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "予期しないエラーが発生しました。",
    };
  }
}

/**
 * 公開鍵から署名者のアドレスを取得
 */
export function getAddressFromPublicKey(
  publicKey: string,
  network: NetworkType,
): string {
  try {
    const symbolNetwork = getSymbolNetwork(network);
    const facade = new SymbolFacade(symbolNetwork);
    const publicKeyBytes = new PublicKey(utils.hexToUint8(publicKey));
    const address = facade.network.publicKeyToAddress(publicKeyBytes);
    return address.toString();
  } catch (error) {
    throw new Error(
      `アドレス取得に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

/**
 * 秘密鍵から公開鍵を取得
 */
export function getPublicKeyFromPrivateKey(privateKey: string): string {
  try {
    if (!validatePrivateKey(privateKey)) {
      throw new Error("無効な秘密鍵形式です");
    }

    const key = new PrivateKey(privateKey);
    const facade = new SymbolFacade(Network.TESTNET); // ネットワークは公開鍵取得には影響しない
    const account = facade.createAccount(key);
    return account.publicKey.toString();
  } catch (error) {
    throw new Error(
      `公開鍵取得に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    );
  }
}

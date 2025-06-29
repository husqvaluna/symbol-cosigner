/**
 * Symbol REST API 通信ユーティリティ
 *
 * 設計方針:
 * - エラーハンドリング・タイムアウト処理
 * - 型安全性の確保
 * - レスポンス検証
 * - 接続失敗時の適切なエラーメッセージ
 *
 * 関連ファイル:
 * - app/types/transaction.ts
 * - docs/openapi-symbol.yml
 */

import type {
  FetchPartialTransactionsParams,
  PartialTransactionsResponseDTO,
  DisplayTransaction,
  ApiResult,
  ApiError,
} from "../types/transaction";

// ===== 定数 =====

/** API タイムアウト時間（ミリ秒） */
const API_TIMEOUT = 10000;

/** デフォルトのリクエストパラメータ */
const DEFAULT_PARAMS = {
  type: 16961, // AggregateBonded
  pageSize: 100,
  pageNumber: 1,
  order: 'desc' as const,
};

// ===== ユーティリティ関数 =====

/**
 * URLパラメータを構築
 */
function buildUrlParams(params: FetchPartialTransactionsParams): string {
  const searchParams = new URLSearchParams();
  
  searchParams.append('type', String(params.type ?? DEFAULT_PARAMS.type));
  searchParams.append('address', params.address);
  searchParams.append('pageSize', String(params.pageSize ?? DEFAULT_PARAMS.pageSize));
  searchParams.append('pageNumber', String(params.pageNumber ?? DEFAULT_PARAMS.pageNumber));
  searchParams.append('order', params.order ?? DEFAULT_PARAMS.order);
  
  return searchParams.toString();
}

/**
 * ノードURLを正規化
 */
function normalizeNodeUrl(nodeUrl: string): string {
  // 末尾のスラッシュを削除
  return nodeUrl.replace(/\/$/, '');
}

/**
 * API エラーを作成
 */
function createApiError(message: string, code: string = 'API_ERROR'): ApiError {
  return { code, message };
}

/**
 * レスポンスを検証
 */
function validateResponse(data: unknown): data is PartialTransactionsResponseDTO {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const response = data as Record<string, unknown>;
  
  // 基本構造の確認
  if (!Array.isArray(response.data) || !response.pagination) {
    return false;
  }
  
  // pagination の確認
  const pagination = response.pagination as Record<string, unknown>;
  if (typeof pagination.pageNumber !== 'number' || typeof pagination.pageSize !== 'number') {
    return false;
  }
  
  return true;
}

/**
 * トランザクション期限をDateに変換
 */
function parseDeadline(deadlineStr: string): Date {
  // Symbol の deadline は Nemesis Block からのミリ秒数
  // Nemesis Block は 2021-03-16 00:06:25 UTC
  const nemesisTimestamp = 1615852585000; // Nemesis Block のタイムスタンプ
  const deadline = Number(deadlineStr);
  return new Date(nemesisTimestamp + deadline);
}

/**
 * API レスポンスを表示用形式に変換
 */
function convertToDisplayTransactions(
  response: PartialTransactionsResponseDTO
): DisplayTransaction[] {
  return response.data.map((item) => ({
    id: item.id,
    hash: item.meta.hash,
    signerPublicKey: item.transaction.signerPublicKey,
    maxFee: item.transaction.maxFee,
    deadline: item.transaction.deadline,
    cosignatureCount: item.transaction.cosignatures.length,
    cosignerPublicKeys: item.transaction.cosignatures.map(c => c.signerPublicKey),
    createdAt: parseDeadline(item.transaction.deadline),
  }));
}

// ===== メイン関数 =====

/**
 * 部分トランザクション一覧を取得
 */
export async function fetchPartialTransactions(
  params: FetchPartialTransactionsParams
): Promise<ApiResult<DisplayTransaction[]>> {
  try {
    // パラメータ検証
    if (!params.nodeUrl || !params.address) {
      return {
        success: false,
        error: createApiError('ノードURLとアドレスは必須です', 'INVALID_PARAMS'),
      };
    }

    // URL構築
    const baseUrl = normalizeNodeUrl(params.nodeUrl);
    const urlParams = buildUrlParams(params);
    const fullUrl = `${baseUrl}/transactions/partial?${urlParams}`;

    // タイムアウト処理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // API リクエスト
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // ステータスコード確認
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: createApiError('指定されたリソースが見つかりません', 'NOT_FOUND'),
          };
        }
        if (response.status === 409) {
          return {
            success: false,
            error: createApiError('無効なパラメータです', 'INVALID_ARGUMENT'),
          };
        }
        return {
          success: false,
          error: createApiError(
            `サーバーエラー: ${response.status} ${response.statusText}`,
            'SERVER_ERROR'
          ),
        };
      }

      // レスポンス解析
      const data = await response.json();

      // レスポンス検証
      if (!validateResponse(data)) {
        return {
          success: false,
          error: createApiError('無効なレスポンス形式です', 'INVALID_RESPONSE'),
        };
      }

      // 表示用形式に変換
      const transactions = convertToDisplayTransactions(data);

      return {
        success: true,
        data: transactions,
      };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            error: createApiError('リクエストがタイムアウトしました', 'TIMEOUT'),
          };
        }
        if (fetchError.message.includes('fetch')) {
          return {
            success: false,
            error: createApiError('ネットワーク接続に失敗しました', 'NETWORK_ERROR'),
          };
        }
      }
      
      throw fetchError;
    }

  } catch (error) {
    return {
      success: false,
      error: createApiError(
        error instanceof Error ? error.message : '予期しないエラーが発生しました',
        'UNKNOWN_ERROR'
      ),
    };
  }
}

/**
 * トランザクション詳細を取得（将来の拡張用）
 */
export async function fetchPartialTransactionById(
  nodeUrl: string,
  transactionId: string
): Promise<ApiResult<DisplayTransaction>> {
  // 将来実装予定
  return {
    success: false,
    error: createApiError('未実装の機能です', 'NOT_IMPLEMENTED'),
  };
}
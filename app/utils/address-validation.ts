/**
 * Symbol アドレスバリデーション関数
 * 仕様: @plans/specs.md 参照
 *
 * Symbol アドレスは39文字のBase32エンコード済みテキスト
 * または45文字のハイフン付きフォーマット
 */

// Base32文字セット: A-Z, 2-7 (32文字)
const BASE32_CHARS = /^[A-Z2-7]+$/;

/**
 * Symbol アドレスを正規化する
 * ハイフンを除去し、大文字に変換
 */
export function normalizeAddress(address: string): string {
  return address.replace(/-/g, "").toUpperCase();
}

/**
 * Symbol アドレスのバリデーション
 */
export function validateSymbolAddress(address: string): {
  isValid: boolean;
  error?: string;
  normalizedAddress?: string;
} {
  if (!address) {
    return {
      isValid: false,
      error: "アドレスを入力してください",
    };
  }

  // 正規化（ハイフン除去、大文字化）
  const normalized = normalizeAddress(address);

  // 文字数チェック（39文字）
  if (normalized.length !== 39) {
    return {
      isValid: false,
      error: `アドレスは39文字である必要があります（現在: ${normalized.length}文字）`,
    };
  }

  // Base32文字セットチェック
  if (!BASE32_CHARS.test(normalized)) {
    return {
      isValid: false,
      error: "アドレスに無効な文字が含まれています（A-Z, 2-7のみ有効）",
    };
  }

  return {
    isValid: true,
    normalizedAddress: normalized,
  };
}

/**
 * ハイフン付きアドレスのフォーマットチェック
 * 6文字ごとにハイフンが入っているかチェック
 */
export function validateFormattedAddress(address: string): boolean {
  // 45文字のハイフン付きフォーマット
  if (address.length !== 45) {
    return false;
  }

  // ハイフンの位置チェック（6, 13, 20, 27, 34, 41文字目）
  const expectedHyphens = [6, 13, 20, 27, 34, 41];
  for (const pos of expectedHyphens) {
    if (address[pos] !== "-") {
      return false;
    }
  }

  // ハイフン以外の部分をチェック
  const withoutHyphens = address.replace(/-/g, "");
  return withoutHyphens.length === 39 && BASE32_CHARS.test(withoutHyphens);
}

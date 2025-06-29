/**
 * アドレス管理のためのJotai atoms
 *
 * 設計方針:
 * - アトミックな状態管理
 * - ローカルストレージでの永続化
 * - 型安全性の確保
 * - リアクティブな状態反映
 *
 * 関連ファイル: app/types/address.ts
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type {
  Address,
  CreateAddressParams,
  UpdateAddressParams,
  AddressFilter,
} from "../types/address";
import { validateSymbolAddress } from "../utils/address-validation";

// ===== プリミティブAtoms =====

/**
 * アドレス一覧の基本atom（ローカルストレージと同期）
 */
export const addressesAtom = atomWithStorage<Address[]>(
  "symbol-cosigner-addresses",
  [],
);

/**
 * アドレスフィルタリング条件のatom
 */
export const addressFilterAtom = atom<AddressFilter>({});

// ===== 派生Atoms (Derived Atoms) =====

/**
 * フィルタリングされたアドレス一覧
 */
export const filteredAddressesAtom = atom((get) => {
  const addresses = get(addressesAtom);
  const filter = get(addressFilterAtom);

  return addresses.filter((addr) => {
    // アクティブフィルタ
    if (filter.activeOnly && !addr.active) {
      return false;
    }

    // メモ検索
    if (
      filter.memoSearch &&
      !addr.memo.toLowerCase().includes(filter.memoSearch.toLowerCase())
    ) {
      return false;
    }

    // アドレス検索
    if (
      filter.addressSearch &&
      !addr.address.toLowerCase().includes(filter.addressSearch.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
});

/**
 * 現在アクティブなアドレス
 */
export const activeAddressAtom = atom((get) => {
  const addresses = get(addressesAtom);
  return addresses.find((addr) => addr.active) || null;
});

/**
 * アドレス数の統計
 */
export const addressStatsAtom = atom((get) => {
  const addresses = get(addressesAtom);
  return {
    total: addresses.length,
    active: addresses.filter((addr) => addr.active).length,
    inactive: addresses.filter((addr) => !addr.active).length,
  };
});

/**
 * 選択中のアドレスID
 */
export const selectedAddressIdAtom = atom<string>("");

/**
 * 選択中のアドレス情報
 */
export const selectedAddressAtom = atom((get) => {
  const addresses = get(addressesAtom);
  const selectedId = get(selectedAddressIdAtom);
  if (!selectedId) return null;
  return addresses.find((addr) => addr.address === selectedId) || null;
});

// ===== アクションAtoms =====

/**
 * アドレス追加アクション
 */
export const addAddressAtom = atom(
  null,
  (get, set, params: CreateAddressParams) => {
    const addresses = get(addressesAtom);

    // バリデーション
    const validation = validateSymbolAddress(params.address);
    if (!validation.isValid || !validation.normalizedAddress) {
      throw new Error(validation.error || "Invalid address");
    }

    const normalizedAddress = validation.normalizedAddress;

    // 重複チェック
    if (addresses.some((addr) => addr.address === normalizedAddress)) {
      throw new Error("このアドレスは既に登録されています");
    }

    // 新しいアドレスがアクティブな場合、他のアドレスを非アクティブにする
    const updatedAddresses = params.active
      ? addresses.map((addr) => ({ ...addr, active: false }))
      : addresses;

    // 新しいアドレスを追加
    const newAddress: Address = {
      address: normalizedAddress,
      memo: params.memo || "",
      active: params.active || false,
      createdAt: new Date().toISOString(),
    };

    set(addressesAtom, [...updatedAddresses, newAddress]);
    return newAddress;
  },
);

/**
 * アドレス更新アクション
 */
export const updateAddressAtom = atom(
  null,
  (get, set, params: UpdateAddressParams) => {
    const addresses = get(addressesAtom);
    const targetIndex = addresses.findIndex(
      (addr) => addr.address === params.address,
    );

    if (targetIndex === -1) {
      throw new Error("アドレスが見つかりません");
    }

    // アクティブ状態を変更する場合、他のアドレスを非アクティブにする
    let updatedAddresses = [...addresses];
    if (params.active && !addresses[targetIndex].active) {
      updatedAddresses = addresses.map((addr) => ({ ...addr, active: false }));
    }

    // アドレスを更新
    updatedAddresses[targetIndex] = {
      ...updatedAddresses[targetIndex],
      ...params,
      lastUsedAt: params.lastUsedAt || new Date().toISOString(),
    };

    set(addressesAtom, updatedAddresses);
    return updatedAddresses[targetIndex];
  },
);

/**
 * アドレス削除アクション
 */
export const removeAddressAtom = atom(
  null,
  (get, set, targetAddress: string) => {
    const addresses = get(addressesAtom);
    const filteredAddresses = addresses.filter(
      (addr) => addr.address !== targetAddress,
    );

    if (filteredAddresses.length === addresses.length) {
      throw new Error("アドレスが見つかりません");
    }

    set(addressesAtom, filteredAddresses);
    return true;
  },
);

/**
 * アクティブアドレス設定アクション
 */
export const setActiveAddressAtom = atom(
  null,
  (get, set, targetAddress: string) => {
    const addresses = get(addressesAtom);
    const targetExists = addresses.some(
      (addr) => addr.address === targetAddress,
    );

    if (!targetExists) {
      throw new Error("アドレスが見つかりません");
    }

    // 全てのアドレスを非アクティブにして、対象のアドレスのみアクティブにする
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      active: addr.address === targetAddress,
      lastUsedAt:
        addr.address === targetAddress
          ? new Date().toISOString()
          : addr.lastUsedAt,
    }));

    set(addressesAtom, updatedAddresses);
    return updatedAddresses.find((addr) => addr.address === targetAddress)!;
  },
);

/**
 * フィルタ設定アクション
 */
export const setAddressFilterAtom = atom(
  null,
  (get, set, filter: Partial<AddressFilter>) => {
    const currentFilter = get(addressFilterAtom);
    set(addressFilterAtom, { ...currentFilter, ...filter });
  },
);

/**
 * フィルタリセットアクション
 */
export const resetAddressFilterAtom = atom(null, (_get, set) => {
  set(addressFilterAtom, {});
});

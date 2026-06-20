// コレクションの集計（純粋関数）。コンプリート率・カテゴリ別・ダブり数を導出する。
// 保存データ（save.ts）からの導出はここに集約し、UIは結果を表示するだけにする（CLAUDE.md §5）。

import type { Category, ItemDef } from "../data/items";
import type { SaveData } from "./save";

/** カテゴリ単位の取得状況。 */
export interface CategoryStat {
  collected: number;
  total: number;
}

/** コレクション全体の集計結果。 */
export interface CollectionStats {
  /** 取得済みの種類数。 */
  collected: number;
  /** 全種類数。 */
  total: number;
  /** コンプリート率（0〜1）。total=0 のときは 0。 */
  ratio: number;
  /** 全種コンプ済みか（total>0 かつ collected===total）。 */
  isComplete: boolean;
  /** カテゴリ別の取得状況（items に登場したカテゴリのみ）。 */
  byCategory: Partial<Record<Category, CategoryStat>>;
}

/** そのアイテムを1つ以上持っているか。 */
export function isCollected(save: SaveData, itemId: string): boolean {
  return (save.collected[itemId]?.count ?? 0) > 0;
}

/** そのアイテムの取得個数（未取得は0）。 */
export function itemCount(save: SaveData, itemId: string): number {
  return save.collected[itemId]?.count ?? 0;
}

/** ダブり数（取得個数-1、未取得・1個は0）。 */
export function dupeCount(save: SaveData, itemId: string): number {
  return Math.max(0, itemCount(save, itemId) - 1);
}

/** コレクション全体・カテゴリ別の集計を求める。 */
export function collectionStats(save: SaveData, items: readonly ItemDef[]): CollectionStats {
  const byCategory: Partial<Record<Category, CategoryStat>> = {};
  let collected = 0;

  for (const item of items) {
    const cat = (byCategory[item.category] ??= { collected: 0, total: 0 });
    cat.total++;
    if (isCollected(save, item.id)) {
      cat.collected++;
      collected++;
    }
  }

  const total = items.length;
  return {
    collected,
    total,
    ratio: total === 0 ? 0 : collected / total,
    isComplete: total > 0 && collected === total,
    byCategory,
  };
}

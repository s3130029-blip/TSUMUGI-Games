// ガチャの抽選ロジック（純粋関数）。演出・DOM・音とは分離する（CLAUDE.md §5）。
// 乱数は必ず Rng（シード可能 PRNG）を経由する。

import type { ItemDef, Rarity } from "../data/items";
import type { Rng } from "./prng";
import { RARITY_WEIGHTS } from "../config";

/** 抽選で使うレア度の順序（重み付けの並び）。 */
const RARITY_ORDER: readonly Rarity[] = ["common", "rare", "superRare"];

/**
 * 重み付き抽選の汎用関数。entries から weightOf に比例した確率で1つ選ぶ。
 * - 負の重みは 0 として扱う。
 * - 重みの合計が 0 以下なら均等抽選にフォールバックする。
 * @throws entries が空のとき
 */
export function pickWeighted<T>(rng: Rng, entries: readonly T[], weightOf: (item: T) => number): T {
  if (entries.length === 0) throw new Error("pickWeighted: entries が空です");

  const weights = entries.map((e) => Math.max(0, weightOf(e)));
  const total = weights.reduce((sum, w) => sum + w, 0);

  // 重みが無い場合は均等に
  if (total <= 0) {
    const idx = Math.min(entries.length - 1, Math.floor(rng() * entries.length));
    return entries[idx]!;
  }

  let r = rng() * total;
  for (let i = 0; i < entries.length; i++) {
    if (r < weights[i]!) return entries[i]!;
    r -= weights[i]!;
  }
  // 浮動小数の誤差で末尾に到達した場合のフォールバック
  return entries[entries.length - 1]!;
}

/** アイテム配列をレア度ごとに分類する。 */
export function groupByRarity(items: readonly ItemDef[]): Record<Rarity, ItemDef[]> {
  const groups: Record<Rarity, ItemDef[]> = { common: [], rare: [], superRare: [] };
  for (const item of items) groups[item.rarity].push(item);
  return groups;
}

/**
 * 1回ガチャを引く（2段抽選）。
 *   ① レア度を重みで抽選（アイテムが存在するレア度のみが対象）
 *   ② そのレア度のプールから均等抽選
 * @throws items が空のとき
 */
export function drawItem(
  rng: Rng,
  items: readonly ItemDef[],
  weights: Record<Rarity, number> = RARITY_WEIGHTS,
): ItemDef {
  if (items.length === 0) throw new Error("drawItem: items が空です");

  const groups = groupByRarity(items);
  // アイテムが1つも無いレア度は抽選対象から外す（空プールを引かないため）
  const availableRarities = RARITY_ORDER.filter((r) => groups[r].length > 0);

  const rarity = pickWeighted(rng, availableRarities, (r) => weights[r] ?? 0);
  return pickWeighted(rng, groups[rarity], () => 1);
}

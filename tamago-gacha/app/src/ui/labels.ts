// ユーザー向け表示ラベル（日本語）。図鑑・詳細モーダルで共有する（CLAUDE.md §3）。

import type { Category, Rarity } from "../data/items";

/** カテゴリの表示名。 */
export const CATEGORY_LABEL: Record<Category, string> = {
  animal: "どうぶつ",
  sea: "うみ",
  bug: "むし",
  vehicle: "のりもの",
  food: "たべもの",
  fruit: "くだもの",
  sweets: "おかし",
  nature: "しぜん",
};

/** レア度の表示名。 */
export const RARITY_LABEL: Record<Rarity, string> = {
  common: "ノーマル",
  rare: "レア",
  superRare: "げきレア",
};

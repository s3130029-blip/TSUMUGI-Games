// アイテムマスタ（モノの定義）。
// このファイル1つに型と初期データを集約し、追加・編集しやすくする（REQUIREMENTS.md 5.1）。

/** モノのカテゴリ。必要に応じて追加してよい。 */
export type Category = "animal" | "vehicle" | "food";

/** レア度（3段階）。 */
export type Rarity = "common" | "rare" | "superRare";

/** アイテム定義（マスタデータ1件）。 */
export interface ItemDef {
  /** 一意のID（例: "apple"）。 */
  readonly id: string;
  /** 日本語名（例: "りんご"）。 */
  readonly nameJa: string;
  /** 英語名（例: "apple"）。 */
  readonly nameEn: string;
  readonly category: Category;
  readonly rarity: Rarity;
  /** 表示用の絵文字（例: "🍎"）。 */
  readonly emoji: string;
  /**
   * 将来の画像差し替え用（SVG/PNG の URL）。
   * 設定されていれば emoji の代わりに画像を表示する想定（フェーズ1では未使用）。
   */
  readonly assetUrl?: string;
}

/** 表示に使うアセットを解決する。画像があれば優先、なければ絵文字。 */
export function itemDisplay(item: ItemDef): { kind: "image"; src: string } | { kind: "emoji"; char: string } {
  if (item.assetUrl) return { kind: "image", src: item.assetUrl };
  return { kind: "emoji", char: item.emoji };
}

/**
 * 初期アイテム（フェーズ1は十数種〜。動物・乗り物・食べ物をバランス良く、レア度も分散）。
 * 最終的には 30〜50 種へ拡張する（REQUIREMENTS.md 5.1）。
 */
export const ITEMS: readonly ItemDef[] = [
  // --- 動物 ---
  { id: "dog", nameJa: "いぬ", nameEn: "dog", category: "animal", rarity: "common", emoji: "🐶" },
  { id: "cat", nameJa: "ねこ", nameEn: "cat", category: "animal", rarity: "common", emoji: "🐱" },
  { id: "rabbit", nameJa: "うさぎ", nameEn: "rabbit", category: "animal", rarity: "common", emoji: "🐰" },
  { id: "elephant", nameJa: "ぞう", nameEn: "elephant", category: "animal", rarity: "common", emoji: "🐘" },
  { id: "panda", nameJa: "パンダ", nameEn: "panda", category: "animal", rarity: "common", emoji: "🐼" },
  { id: "fox", nameJa: "きつね", nameEn: "fox", category: "animal", rarity: "rare", emoji: "🦊" },
  { id: "lion", nameJa: "ライオン", nameEn: "lion", category: "animal", rarity: "rare", emoji: "🦁" },
  { id: "unicorn", nameJa: "ユニコーン", nameEn: "unicorn", category: "animal", rarity: "superRare", emoji: "🦄" },
  { id: "dragon", nameJa: "ドラゴン", nameEn: "dragon", category: "animal", rarity: "superRare", emoji: "🐉" },

  // --- 乗り物 ---
  { id: "car", nameJa: "くるま", nameEn: "car", category: "vehicle", rarity: "common", emoji: "🚗" },
  { id: "train", nameJa: "でんしゃ", nameEn: "train", category: "vehicle", rarity: "common", emoji: "🚆" },
  { id: "ship", nameJa: "ふね", nameEn: "ship", category: "vehicle", rarity: "common", emoji: "🚢" },
  { id: "fire_engine", nameJa: "しょうぼうしゃ", nameEn: "fire engine", category: "vehicle", rarity: "common", emoji: "🚒" },
  { id: "airplane", nameJa: "ひこうき", nameEn: "airplane", category: "vehicle", rarity: "rare", emoji: "✈️" },
  { id: "helicopter", nameJa: "ヘリコプター", nameEn: "helicopter", category: "vehicle", rarity: "rare", emoji: "🚁" },
  { id: "rocket", nameJa: "ロケット", nameEn: "rocket", category: "vehicle", rarity: "superRare", emoji: "🚀" },

  // --- 食べ物 ---
  { id: "apple", nameJa: "りんご", nameEn: "apple", category: "food", rarity: "common", emoji: "🍎" },
  { id: "banana", nameJa: "バナナ", nameEn: "banana", category: "food", rarity: "common", emoji: "🍌" },
  { id: "strawberry", nameJa: "いちご", nameEn: "strawberry", category: "food", rarity: "common", emoji: "🍓" },
  { id: "grapes", nameJa: "ぶどう", nameEn: "grapes", category: "food", rarity: "common", emoji: "🍇" },
  { id: "cake", nameJa: "ケーキ", nameEn: "cake", category: "food", rarity: "rare", emoji: "🍰" },
  { id: "icecream", nameJa: "アイス", nameEn: "ice cream", category: "food", rarity: "rare", emoji: "🍦" },
  { id: "donut", nameJa: "ドーナツ", nameEn: "donut", category: "food", rarity: "superRare", emoji: "🍩" },
];

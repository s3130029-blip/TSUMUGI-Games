// 調整値（確率・演出時間など）を一箇所に集約する（CLAUDE.md §10）。
// マジックナンバーをコードに散らさず、ここを編集すれば挙動を調整できるようにする。

import type { Rarity } from "./data/items";

/**
 * ガチャ演出シーケンスの各段階の長さ（ミリ秒）。
 * REQUIREMENTS.md 4.1 の目安に準拠。テンポは軽快に。
 */
export const TIMING = {
  /** ① 予兆：タマゴがガタッと一瞬反応 */
  squash: 180,
  /** ②③ 振動＋ひび割れ（重ねる） */
  shake: 1000,
  /** ④ パカッ：上半分が開く＋フラッシュ */
  open: 220,
  /** ⑤⑥ 登場（バウンド）＋キラキラ */
  reveal: 450,
} as const;

/**
 * レア度ごとの抽選の重み。合計値は任意（抽選側で正規化する）。
 * REQUIREMENTS.md 4.2 の例（common 80% / rare 18% / superRare 2%）。
 * ※フェーズ1から器は重みに対応させ、レア専用演出はフェーズ2で追加する。
 */
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 80,
  rare: 18,
  superRare: 2,
};

/**
 * レア度ごとの演出パラメータ（フェーズ2）。
 * - shakeScale: 振動（溜め）時間の倍率。レアほど長く溜める。
 * - holdBeforeOpen: パカッ直前の「ため」（ミリ秒）。スローモーション気味の演出用。
 * - sparkleCount: 登場時のキラキラ粒子数。
 * - sparkleVariant: キラキラの見た目（sparkle.ts のバリアント）。
 * - label: 結果表示のレアバッジ文言（common は空）。
 * ※ superRare の粒子数は「目安30〜40」の上限付近。稀かつ短命なので CSS で許容。
 *   恒常的に増やす場合は Canvas へ移行する（CLAUDE.md §4）。
 */
export const RARITY_EFFECT: Record<
  Rarity,
  {
    shakeScale: number;
    holdBeforeOpen: number;
    sparkleCount: number;
    sparkleVariant: "normal" | "rare" | "super";
    label: string;
  }
> = {
  common: { shakeScale: 1.0, holdBeforeOpen: 0, sparkleCount: 14, sparkleVariant: "normal", label: "" },
  rare: { shakeScale: 1.6, holdBeforeOpen: 180, sparkleCount: 26, sparkleVariant: "rare", label: "レア！" },
  superRare: { shakeScale: 2.3, holdBeforeOpen: 420, sparkleCount: 40, sparkleVariant: "super", label: "げきレア!!" },
};

/** localStorage の保存キー（フェーズ3で使用）。スキーマ更新時はサフィックスを上げる。 */
export const SAVE_KEY = "tamago-gacha:save:v1";

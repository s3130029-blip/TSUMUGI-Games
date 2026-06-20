// アイテムマスタ（モノの定義）。
// このファイル1つに型と初期データを集約し、追加・編集しやすくする（REQUIREMENTS.md 5.1）。

/** モノのカテゴリ。必要に応じて追加してよい。 */
export type Category =
  | "animal" // どうぶつ（陸の生き物・空想）
  | "sea" // うみのいきもの
  | "bug" // むし
  | "vehicle" // のりもの
  | "food" // たべもの（ごはん・おかず）
  | "fruit" // くだもの・やさい
  | "sweets" // おかし
  | "nature"; // しぜん（おひさま・つき・はな など）

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
 * アイテムマスタ（約100種）。8カテゴリにわたり、レア度も分散させる（REQUIREMENTS.md 5.1）。
 * - id は保存データのキーになるため、既存 id は変更しない（追加のみ）。
 * - common 多め / rare そこそこ / superRare ひとにぎり、で抽選バランスを取る。
 */
export const ITEMS: readonly ItemDef[] = [
  // --- どうぶつ ---
  { id: "dog", nameJa: "いぬ", nameEn: "dog", category: "animal", rarity: "common", emoji: "🐶" },
  { id: "cat", nameJa: "ねこ", nameEn: "cat", category: "animal", rarity: "common", emoji: "🐱" },
  { id: "rabbit", nameJa: "うさぎ", nameEn: "rabbit", category: "animal", rarity: "common", emoji: "🐰" },
  { id: "elephant", nameJa: "ぞう", nameEn: "elephant", category: "animal", rarity: "common", emoji: "🐘" },
  { id: "panda", nameJa: "パンダ", nameEn: "panda", category: "animal", rarity: "common", emoji: "🐼" },
  { id: "bear", nameJa: "くま", nameEn: "bear", category: "animal", rarity: "common", emoji: "🐻" },
  { id: "monkey", nameJa: "さる", nameEn: "monkey", category: "animal", rarity: "common", emoji: "🐵" },
  { id: "pig", nameJa: "ぶた", nameEn: "pig", category: "animal", rarity: "common", emoji: "🐷" },
  { id: "cow", nameJa: "うし", nameEn: "cow", category: "animal", rarity: "common", emoji: "🐮" },
  { id: "horse", nameJa: "うま", nameEn: "horse", category: "animal", rarity: "common", emoji: "🐴" },
  { id: "mouse", nameJa: "ねずみ", nameEn: "mouse", category: "animal", rarity: "common", emoji: "🐭" },
  { id: "tiger", nameJa: "とら", nameEn: "tiger", category: "animal", rarity: "rare", emoji: "🐯" },
  { id: "fox", nameJa: "きつね", nameEn: "fox", category: "animal", rarity: "rare", emoji: "🦊" },
  { id: "lion", nameJa: "ライオン", nameEn: "lion", category: "animal", rarity: "rare", emoji: "🦁" },
  { id: "giraffe", nameJa: "きりん", nameEn: "giraffe", category: "animal", rarity: "rare", emoji: "🦒" },
  { id: "unicorn", nameJa: "ユニコーン", nameEn: "unicorn", category: "animal", rarity: "superRare", emoji: "🦄" },
  { id: "dragon", nameJa: "ドラゴン", nameEn: "dragon", category: "animal", rarity: "superRare", emoji: "🐉" },

  // --- うみのいきもの ---
  { id: "fish", nameJa: "さかな", nameEn: "fish", category: "sea", rarity: "common", emoji: "🐟" },
  { id: "tropical_fish", nameJa: "ねったいぎょ", nameEn: "tropical fish", category: "sea", rarity: "common", emoji: "🐠" },
  { id: "dolphin", nameJa: "いるか", nameEn: "dolphin", category: "sea", rarity: "common", emoji: "🐬" },
  { id: "whale", nameJa: "くじら", nameEn: "whale", category: "sea", rarity: "common", emoji: "🐳" },
  { id: "octopus", nameJa: "たこ", nameEn: "octopus", category: "sea", rarity: "common", emoji: "🐙" },
  { id: "crab", nameJa: "かに", nameEn: "crab", category: "sea", rarity: "common", emoji: "🦀" },
  { id: "shrimp", nameJa: "えび", nameEn: "shrimp", category: "sea", rarity: "common", emoji: "🦐" },
  { id: "penguin", nameJa: "ペンギン", nameEn: "penguin", category: "sea", rarity: "common", emoji: "🐧" },
  { id: "turtle", nameJa: "かめ", nameEn: "turtle", category: "sea", rarity: "rare", emoji: "🐢" },
  { id: "shark", nameJa: "さめ", nameEn: "shark", category: "sea", rarity: "rare", emoji: "🦈" },
  { id: "squid", nameJa: "いか", nameEn: "squid", category: "sea", rarity: "rare", emoji: "🦑" },
  { id: "blowfish", nameJa: "ふぐ", nameEn: "blowfish", category: "sea", rarity: "rare", emoji: "🐡" },

  // --- むし ---
  { id: "butterfly", nameJa: "ちょうちょ", nameEn: "butterfly", category: "bug", rarity: "common", emoji: "🦋" },
  { id: "bee", nameJa: "はち", nameEn: "bee", category: "bug", rarity: "common", emoji: "🐝" },
  { id: "ladybug", nameJa: "てんとうむし", nameEn: "ladybug", category: "bug", rarity: "common", emoji: "🐞" },
  { id: "ant", nameJa: "あり", nameEn: "ant", category: "bug", rarity: "common", emoji: "🐜" },
  { id: "snail", nameJa: "かたつむり", nameEn: "snail", category: "bug", rarity: "common", emoji: "🐌" },
  { id: "caterpillar", nameJa: "あおむし", nameEn: "caterpillar", category: "bug", rarity: "common", emoji: "🐛" },
  { id: "worm", nameJa: "みみず", nameEn: "worm", category: "bug", rarity: "common", emoji: "🪱" },
  { id: "spider", nameJa: "くも", nameEn: "spider", category: "bug", rarity: "rare", emoji: "🕷️" },
  { id: "beetle", nameJa: "かぶとむし", nameEn: "beetle", category: "bug", rarity: "rare", emoji: "🪲" },
  { id: "cricket", nameJa: "こおろぎ", nameEn: "cricket", category: "bug", rarity: "rare", emoji: "🦗" },

  // --- のりもの ---
  { id: "car", nameJa: "くるま", nameEn: "car", category: "vehicle", rarity: "common", emoji: "🚗" },
  { id: "taxi", nameJa: "タクシー", nameEn: "taxi", category: "vehicle", rarity: "common", emoji: "🚕" },
  { id: "bus", nameJa: "バス", nameEn: "bus", category: "vehicle", rarity: "common", emoji: "🚌" },
  { id: "train", nameJa: "でんしゃ", nameEn: "train", category: "vehicle", rarity: "common", emoji: "🚆" },
  { id: "ship", nameJa: "ふね", nameEn: "ship", category: "vehicle", rarity: "common", emoji: "🚢" },
  { id: "fire_engine", nameJa: "しょうぼうしゃ", nameEn: "fire engine", category: "vehicle", rarity: "common", emoji: "🚒" },
  { id: "police_car", nameJa: "パトカー", nameEn: "police car", category: "vehicle", rarity: "common", emoji: "🚓" },
  { id: "ambulance", nameJa: "きゅうきゅうしゃ", nameEn: "ambulance", category: "vehicle", rarity: "common", emoji: "🚑" },
  { id: "truck", nameJa: "トラック", nameEn: "truck", category: "vehicle", rarity: "common", emoji: "🚚" },
  { id: "tractor", nameJa: "トラクター", nameEn: "tractor", category: "vehicle", rarity: "common", emoji: "🚜" },
  { id: "bicycle", nameJa: "じてんしゃ", nameEn: "bicycle", category: "vehicle", rarity: "common", emoji: "🚲" },
  { id: "airplane", nameJa: "ひこうき", nameEn: "airplane", category: "vehicle", rarity: "rare", emoji: "✈️" },
  { id: "helicopter", nameJa: "ヘリコプター", nameEn: "helicopter", category: "vehicle", rarity: "rare", emoji: "🚁" },
  { id: "rocket", nameJa: "ロケット", nameEn: "rocket", category: "vehicle", rarity: "superRare", emoji: "🚀" },

  // --- たべもの ---
  { id: "hamburger", nameJa: "ハンバーガー", nameEn: "hamburger", category: "food", rarity: "common", emoji: "🍔" },
  { id: "pizza", nameJa: "ピザ", nameEn: "pizza", category: "food", rarity: "common", emoji: "🍕" },
  { id: "sushi", nameJa: "おすし", nameEn: "sushi", category: "food", rarity: "common", emoji: "🍣" },
  { id: "rice_ball", nameJa: "おにぎり", nameEn: "rice ball", category: "food", rarity: "common", emoji: "🍙" },
  { id: "bread", nameJa: "パン", nameEn: "bread", category: "food", rarity: "common", emoji: "🍞" },
  { id: "fried_egg", nameJa: "めだまやき", nameEn: "fried egg", category: "food", rarity: "common", emoji: "🍳" },
  { id: "ramen", nameJa: "ラーメン", nameEn: "ramen", category: "food", rarity: "common", emoji: "🍜" },
  { id: "hotdog", nameJa: "ホットドッグ", nameEn: "hot dog", category: "food", rarity: "common", emoji: "🌭" },
  { id: "fries", nameJa: "ポテト", nameEn: "french fries", category: "food", rarity: "common", emoji: "🍟" },
  { id: "curry", nameJa: "カレー", nameEn: "curry", category: "food", rarity: "common", emoji: "🍛" },
  { id: "taco", nameJa: "タコス", nameEn: "taco", category: "food", rarity: "rare", emoji: "🌮" },
  { id: "spaghetti", nameJa: "スパゲッティ", nameEn: "spaghetti", category: "food", rarity: "rare", emoji: "🍝" },

  // --- くだもの・やさい ---
  { id: "apple", nameJa: "りんご", nameEn: "apple", category: "fruit", rarity: "common", emoji: "🍎" },
  { id: "banana", nameJa: "バナナ", nameEn: "banana", category: "fruit", rarity: "common", emoji: "🍌" },
  { id: "strawberry", nameJa: "いちご", nameEn: "strawberry", category: "fruit", rarity: "common", emoji: "🍓" },
  { id: "grapes", nameJa: "ぶどう", nameEn: "grapes", category: "fruit", rarity: "common", emoji: "🍇" },
  { id: "orange", nameJa: "オレンジ", nameEn: "orange", category: "fruit", rarity: "common", emoji: "🍊" },
  { id: "watermelon", nameJa: "すいか", nameEn: "watermelon", category: "fruit", rarity: "common", emoji: "🍉" },
  { id: "peach", nameJa: "もも", nameEn: "peach", category: "fruit", rarity: "common", emoji: "🍑" },
  { id: "cherry", nameJa: "さくらんぼ", nameEn: "cherry", category: "fruit", rarity: "common", emoji: "🍒" },
  { id: "pineapple", nameJa: "パイナップル", nameEn: "pineapple", category: "fruit", rarity: "common", emoji: "🍍" },
  { id: "lemon", nameJa: "レモン", nameEn: "lemon", category: "fruit", rarity: "common", emoji: "🍋" },
  { id: "tomato", nameJa: "トマト", nameEn: "tomato", category: "fruit", rarity: "common", emoji: "🍅" },
  { id: "carrot", nameJa: "にんじん", nameEn: "carrot", category: "fruit", rarity: "common", emoji: "🥕" },
  { id: "melon", nameJa: "メロン", nameEn: "melon", category: "fruit", rarity: "rare", emoji: "🍈" },
  { id: "corn", nameJa: "とうもろこし", nameEn: "corn", category: "fruit", rarity: "rare", emoji: "🌽" },

  // --- おかし ---
  { id: "cake", nameJa: "ケーキ", nameEn: "cake", category: "sweets", rarity: "common", emoji: "🍰" },
  { id: "icecream", nameJa: "アイス", nameEn: "ice cream", category: "sweets", rarity: "common", emoji: "🍦" },
  { id: "donut", nameJa: "ドーナツ", nameEn: "donut", category: "sweets", rarity: "common", emoji: "🍩" },
  { id: "cookie", nameJa: "クッキー", nameEn: "cookie", category: "sweets", rarity: "common", emoji: "🍪" },
  { id: "chocolate", nameJa: "チョコ", nameEn: "chocolate", category: "sweets", rarity: "common", emoji: "🍫" },
  { id: "candy", nameJa: "あめ", nameEn: "candy", category: "sweets", rarity: "common", emoji: "🍬" },
  { id: "lollipop", nameJa: "ペロペロキャンディ", nameEn: "lollipop", category: "sweets", rarity: "common", emoji: "🍭" },
  { id: "pudding", nameJa: "プリン", nameEn: "pudding", category: "sweets", rarity: "common", emoji: "🍮" },
  { id: "shaved_ice", nameJa: "かきごおり", nameEn: "shaved ice", category: "sweets", rarity: "common", emoji: "🍧" },
  { id: "dango", nameJa: "だんご", nameEn: "dango", category: "sweets", rarity: "common", emoji: "🍡" },
  { id: "cupcake", nameJa: "カップケーキ", nameEn: "cupcake", category: "sweets", rarity: "rare", emoji: "🧁" },
  { id: "birthday_cake", nameJa: "バースデーケーキ", nameEn: "birthday cake", category: "sweets", rarity: "superRare", emoji: "🎂" },

  // --- しぜん ---
  { id: "sun", nameJa: "たいよう", nameEn: "sun", category: "nature", rarity: "common", emoji: "☀️" },
  { id: "moon", nameJa: "つき", nameEn: "moon", category: "nature", rarity: "common", emoji: "🌙" },
  { id: "star", nameJa: "ほし", nameEn: "star", category: "nature", rarity: "common", emoji: "⭐" },
  { id: "cloud", nameJa: "くも", nameEn: "cloud", category: "nature", rarity: "common", emoji: "☁️" },
  { id: "snowman", nameJa: "ゆきだるま", nameEn: "snowman", category: "nature", rarity: "common", emoji: "⛄" },
  { id: "snow", nameJa: "ゆき", nameEn: "snow", category: "nature", rarity: "common", emoji: "❄️" },
  { id: "fire", nameJa: "ひ", nameEn: "fire", category: "nature", rarity: "common", emoji: "🔥" },
  { id: "flower", nameJa: "はな", nameEn: "flower", category: "nature", rarity: "common", emoji: "🌸" },
  { id: "tulip", nameJa: "チューリップ", nameEn: "tulip", category: "nature", rarity: "common", emoji: "🌷" },
  { id: "tree", nameJa: "き", nameEn: "tree", category: "nature", rarity: "common", emoji: "🌳" },
  { id: "clover", nameJa: "よつばのクローバー", nameEn: "four-leaf clover", category: "nature", rarity: "rare", emoji: "🍀" },
  { id: "rainbow", nameJa: "にじ", nameEn: "rainbow", category: "nature", rarity: "rare", emoji: "🌈" },
  { id: "shooting_star", nameJa: "ながれぼし", nameEn: "shooting star", category: "nature", rarity: "superRare", emoji: "🌠" },
];

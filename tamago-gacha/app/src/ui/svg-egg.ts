// タマゴ本体＋ひび割れの SVG マークアップ（CLAUDE.md §4 の描画方針）。
// - 卵は上半分 (.egg-top) / 下半分 (.egg-bottom) のパスに分割し、パカッと開く動きに使う。
// - ひび線 (.egg-crack) は割れ目と同じジグザグ。pathLength="1" を使い、
//   stroke-dashoffset を 1→0 にして「ひびが広がる」表現にする（d属性アニメは使わない）。
// - 揺れ・開く等の動きは各 <g> への CSS transform で付ける（egg.css）。
// - 殻の色は CSS変数（--egg-c1/-c2/-c3/-egg-stroke/-egg-accent）で与え、待機タマゴごとに
//   EGG_PALETTES から1つ選んで切り替える（フェーズ5・task.md のユーザー要望）。
//
// 割れ目の点列（top/bottom/crack で共有）:
//   (35,138)(55,122)(78,150)(100,126)(122,152)(145,123)(165,140)

import type { Rng } from "../core/prng";

/** 殻の配色（グラデ3色＋輪郭＋模様ドット）。 */
export interface EggPalette {
  c1: string;
  c2: string;
  c3: string;
  stroke: string;
  accent: string;
}

/**
 * 殻の色バリエーション。待機タマゴごとに rng で1つ選ぶ。
 * 子どもウケを狙い、淡色ではなく**鮮やかでくっきりした色**にする。
 * c1（上＝明るめのツヤ）→ c2（中）→ c3（下＝濃いめ）のグラデで立体感を出す。
 */
export const EGG_PALETTES: readonly EggPalette[] = [
  { c1: "#ffdcd6", c2: "#ff7a66", c3: "#fb3b22", stroke: "#c9281a", accent: "#ff5235" }, // レッド
  { c1: "#ffe6c2", c2: "#ffab47", c3: "#ff7a00", stroke: "#d65f00", accent: "#ff8c1a" }, // オレンジ
  { c1: "#fff7c2", c2: "#ffe04a", c3: "#ffc400", stroke: "#d9a300", accent: "#ffd11a" }, // イエロー
  { c1: "#d4ffe0", c2: "#58e08a", c3: "#16bf5e", stroke: "#0e9647", accent: "#2bd072" }, // グリーン
  { c1: "#d2efff", c2: "#57b6ff", c3: "#1f8cff", stroke: "#1068c4", accent: "#34a0ff" }, // ブルー
  { c1: "#ecd9ff", c2: "#b277ff", c3: "#8a39f5", stroke: "#6a1bc4", accent: "#9b4dff" }, // パープル
  { c1: "#ffd6ea", c2: "#ff73ab", c3: "#ff3585", stroke: "#d81668", accent: "#ff4f97" }, // ピンク
];

/** rng で殻の配色を1つ選び、SVG要素に CSS変数として設定する（演出用途）。 */
export function applyEggPalette(svg: SVGElement, rng: Rng): void {
  const p = EGG_PALETTES[Math.floor(rng() * EGG_PALETTES.length)] ?? EGG_PALETTES[0]!;
  svg.style.setProperty("--egg-c1", p.c1);
  svg.style.setProperty("--egg-c2", p.c2);
  svg.style.setProperty("--egg-c3", p.c3);
  svg.style.setProperty("--egg-stroke", p.stroke);
  svg.style.setProperty("--egg-accent", p.accent);
}

export function eggSvgMarkup(): string {
  return `
<svg class="egg-svg" viewBox="0 0 200 270" role="img" aria-label="タマゴ" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
      <stop class="egg-stop1" offset="0%" />
      <stop class="egg-stop2" offset="55%" />
      <stop class="egg-stop3" offset="100%" />
    </linearGradient>
  </defs>

  <g class="egg-shake">
    <!-- 下半分 -->
    <g class="egg-bottom">
      <path class="egg-shell"
        d="M35,138 C35,205 60,250 100,250 C140,250 165,205 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle class="egg-accent" cx="72" cy="198" r="11" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="120" cy="214" r="8" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="98" cy="176" r="6" fill="#ff9a3c" opacity="0.45" />
    </g>

    <!-- 上半分 -->
    <g class="egg-top">
      <path class="egg-shell"
        d="M35,138 C35,72 58,18 100,18 C142,18 165,72 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle class="egg-accent" cx="122" cy="70" r="9" fill="#ff9a3c" opacity="0.45" />
      <circle class="egg-accent" cx="82" cy="104" r="7" fill="#ff9a3c" opacity="0.45" />
      <ellipse class="egg-shine" cx="74" cy="74" rx="15" ry="24" fill="#ffffff" opacity="0.5" />
    </g>

    <!-- ひび線（割れ目と同じ形。最初は隠れていて、shake 中に描画される） -->
    <path class="egg-crack"
      d="M35,138 L55,122 L78,150 L100,126 L122,152 L145,123 L165,140"
      fill="none" stroke="#9b6a2f" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round" pathLength="1" />
  </g>
</svg>`;
}

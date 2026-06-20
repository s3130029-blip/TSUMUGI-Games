// タマゴ本体＋ひび割れの SVG マークアップ（CLAUDE.md §4 の描画方針）。
// - 卵は上半分 (.egg-top) / 下半分 (.egg-bottom) のパスに分割し、パカッと開く動きに使う。
// - ひび線 (.egg-crack) は割れ目と同じジグザグ。pathLength="1" を使い、
//   stroke-dashoffset を 1→0 にして「ひびが広がる」表現にする（d属性アニメは使わない）。
// - 揺れ・開く等の動きは各 <g> への CSS transform で付ける（egg.css）。
//
// 割れ目の点列（top/bottom/crack で共有）:
//   (35,138)(55,122)(78,150)(100,126)(122,152)(145,123)(165,140)

export function eggSvgMarkup(): string {
  return `
<svg class="egg-svg" viewBox="0 0 200 270" role="img" aria-label="タマゴ" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7e6" />
      <stop offset="55%" stop-color="#ffe1a8" />
      <stop offset="100%" stop-color="#ffc46b" />
    </linearGradient>
  </defs>

  <g class="egg-shake">
    <!-- 下半分 -->
    <g class="egg-bottom">
      <path class="egg-shell"
        d="M35,138 C35,205 60,250 100,250 C140,250 165,205 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle cx="72" cy="198" r="11" fill="#ff9a3c" opacity="0.45" />
      <circle cx="120" cy="214" r="8" fill="#ff9a3c" opacity="0.45" />
      <circle cx="98" cy="176" r="6" fill="#ff9a3c" opacity="0.45" />
    </g>

    <!-- 上半分 -->
    <g class="egg-top">
      <path class="egg-shell"
        d="M35,138 C35,72 58,18 100,18 C142,18 165,72 165,140 L145,123 L122,152 L100,126 L78,150 L55,122 Z"
        fill="url(#eggGrad)" stroke="#e0a04a" />
      <circle cx="122" cy="70" r="9" fill="#ff9a3c" opacity="0.45" />
      <circle cx="82" cy="104" r="7" fill="#ff9a3c" opacity="0.45" />
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

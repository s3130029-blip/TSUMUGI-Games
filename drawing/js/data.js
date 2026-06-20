/* ============================================================
   data.js  -  アプリで使う定数データ
   ここを編集するだけで 色 / スタンプ / ぬりえ を増やせます。
   イラスト背景(公園・遊園地など)は js/scenes.js にあります。
   ============================================================ */

import { SCENES } from './scenes.js';

// ---- 色パレット(明るい子供向けカラー) ----
export const COLORS = [
  '#000000', // くろ
  '#ffffff', // しろ
  '#ff3b30', // あか
  '#ff9500', // オレンジ
  '#ffcc00', // きいろ
  '#34c759', // みどり
  '#00c7be', // みずいろ
  '#007aff', // あお
  '#5856d6', // むらさき
  '#ff2d92', // ピンク
  '#a2845e', // ちゃいろ
  '#8e8e93', // グレー
];

// ---- 線の太さ(論理ピクセル) ----
export const SIZES = [6, 14, 28, 48];

// ---- スタンプ / ステッカー(絵文字) ----
export const STAMPS = [
  '⭐', '❤️', '🌈', '🌸', '🌻', '🌼', '🍀', '🌟',
  '🐱', '🐶', '🐰', '🐻', '🦊', '🐸', '🐯', '🦁',
  '🦋', '🐝', '🐞', '🐠', '🐙', '🦄', '🐢', '🦖',
  '🍎', '🍓', '🍉', '🍩', '🍰', '🧁', '🍭', '🎈',
  '🚗', '🚒', '✈️', '🚀', '⛵', '🚂', '☀️', '🌙',
];

// ---- 背景 ----
// イラスト背景(scenes.js)を先頭に、そのあとに無地・模様の背景。
export const BACKGROUNDS = [
  ...SCENES,
  { id: 'white',    label: 'しろ',     type: 'color', value: '#ffffff' },
  { id: 'sky',      label: 'そら',     type: 'color', value: '#cdeffd' },
  { id: 'mint',     label: 'みどり',   type: 'color', value: '#d8f7e3' },
  { id: 'peach',    label: 'ピンク',   type: 'color', value: '#ffe1e6' },
  { id: 'lemon',    label: 'きいろ',   type: 'color', value: '#fff6c9' },
  { id: 'lavender', label: 'むらさき', type: 'color', value: '#ece1ff' },
  { id: 'night',    label: 'よる',     type: 'color', value: '#1b2a4a' },
  { id: 'grid',     label: 'ほうがん', type: 'grid',  value: '#e6f0ff' },
  { id: 'dots',     label: 'みずたま', type: 'dots',  value: '#fff0f5' },
];

// ---- ぬりえ 線画テンプレート ----
// viewBox="0 0 100 100" 前提の SVG 中身(線だけ / 塗りなし)
const wrapSvg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ` +
  `fill="none" stroke="#444" stroke-width="2.4" ` +
  `stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`;

export const TEMPLATES = [
  {
    id: 'star', label: 'ほし',
    svg: wrapSvg(
      `<polygon points="50,8 60,36 90,37 66,55 75,84 50,67 25,84 34,55 10,37 40,36"/>`
    ),
  },
  {
    id: 'heart', label: 'ハート',
    svg: wrapSvg(
      `<path d="M50,82 C24,63 16,40 30,30 C40,23 50,30 50,40 C50,30 60,23 70,30 C84,40 76,63 50,82 Z"/>`
    ),
  },
  {
    id: 'flower', label: 'おはな',
    svg: wrapSvg(
      `<circle cx="72" cy="50" r="11"/><circle cx="65.6" cy="65.6" r="11"/>` +
      `<circle cx="50" cy="72" r="11"/><circle cx="34.4" cy="65.6" r="11"/>` +
      `<circle cx="28" cy="50" r="11"/><circle cx="34.4" cy="34.4" r="11"/>` +
      `<circle cx="50" cy="28" r="11"/><circle cx="65.6" cy="34.4" r="11"/>` +
      `<circle cx="50" cy="50" r="12"/>`
    ),
  },
  {
    id: 'sun', label: 'たいよう',
    svg: wrapSvg(
      `<circle cx="50" cy="50" r="22"/>` +
      `<line x1="50" y1="10" x2="50" y2="22"/><line x1="50" y1="78" x2="50" y2="90"/>` +
      `<line x1="10" y1="50" x2="22" y2="50"/><line x1="78" y1="50" x2="90" y2="50"/>` +
      `<line x1="22" y1="22" x2="31" y2="31"/><line x1="69" y1="69" x2="78" y2="78"/>` +
      `<line x1="78" y1="22" x2="69" y2="31"/><line x1="31" y1="69" x2="22" y2="78"/>`
    ),
  },
  {
    id: 'fish', label: 'おさかな',
    svg: wrapSvg(
      `<ellipse cx="42" cy="52" rx="28" ry="16"/>` +
      `<polygon points="68,52 90,38 90,66"/>` +
      `<circle cx="28" cy="47" r="2.6"/>`
    ),
  },
  {
    id: 'house', label: 'おうち',
    svg: wrapSvg(
      `<rect x="28" y="46" width="44" height="36"/>` +
      `<polygon points="24,46 50,22 76,46"/>` +
      `<rect x="44" y="62" width="14" height="20"/>`
    ),
  },
  {
    id: 'car', label: 'くるま',
    svg: wrapSvg(
      `<path d="M16,64 L20,50 L32,40 L60,40 L72,50 L84,54 L84,64 Z"/>` +
      `<circle cx="34" cy="64" r="8"/><circle cx="66" cy="64" r="8"/>`
    ),
  },
  {
    id: 'butterfly', label: 'ちょうちょ',
    svg: wrapSvg(
      `<line x1="50" y1="24" x2="50" y2="70"/>` +
      `<ellipse cx="35" cy="40" rx="15" ry="17"/><ellipse cx="65" cy="40" rx="15" ry="17"/>` +
      `<ellipse cx="38" cy="62" rx="11" ry="12"/><ellipse cx="62" cy="62" rx="11" ry="12"/>` +
      `<line x1="50" y1="24" x2="44" y2="16"/><line x1="50" y1="24" x2="56" y2="16"/>`
    ),
  },
];

// ---- ツール定義(下部バーに並ぶボタン) ----
export const TOOLS = [
  { id: 'pen',        icon: '✏️', label: 'ペン' },
  { id: 'rainbow',    icon: '🌈', label: 'にじいろ' },
  { id: 'eraser',     icon: '🧽', label: 'けしごむ' },
  { id: 'fill',       icon: '🪣', label: 'ぬりつぶし' },
  { id: 'stamp',      icon: '⭐', label: 'スタンプ' },
  { id: 'coloring',   icon: '🎨', label: 'ぬりえ' },
  { id: 'background', icon: '🖼️', label: 'はいけい' },
];

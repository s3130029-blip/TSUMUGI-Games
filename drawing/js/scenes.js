/* ============================================================
   scenes.js  -  イラスト背景(シーン)
   外部画像を使わず SVG をコードで描く(オフライン対応)。
   各シーンは画面いっぱい(cover)で表示され、中央は描画用に広く空けてある。
   ここに { id, label, type:'scene', base, svg } を足すだけで背景を増やせる。
   ============================================================ */

const W = 1000, H = 720;

// SVG を共通の枠で包む(intrinsic サイズを付けて cover 計算しやすくする)
const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
  `width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

// ---- 共通パーツ ----
const cloud = (x, y, s = 1) =>
  `<g fill="#ffffff">` +
  `<ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${34 * s}"/>` +
  `<ellipse cx="${x - 48 * s}" cy="${y + 12 * s}" rx="${44 * s}" ry="${26 * s}"/>` +
  `<ellipse cx="${x + 52 * s}" cy="${y + 12 * s}" rx="${46 * s}" ry="${27 * s}"/></g>`;

const sun = (x, y, r = 56, c = '#ffd84d') => {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30) * Math.PI / 180;
    const x1 = (x + Math.cos(a) * (r + 12)).toFixed(0), y1 = (y + Math.sin(a) * (r + 12)).toFixed(0);
    const x2 = (x + Math.cos(a) * (r + 36)).toFixed(0), y2 = (y + Math.sin(a) * (r + 36)).toFixed(0);
    rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
  }
  return `${rays}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
};

const tree = (x, g, s = 1) => // g = 地面のy
  `<rect x="${x - 13 * s}" y="${g - 78 * s}" width="${26 * s}" height="${86 * s}" rx="8" fill="#9a6b3f"/>` +
  `<circle cx="${x}" cy="${g - 104 * s}" r="${54 * s}" fill="#57b657"/>` +
  `<circle cx="${x - 42 * s}" cy="${g - 74 * s}" r="${40 * s}" fill="#62c462"/>` +
  `<circle cx="${x + 42 * s}" cy="${g - 74 * s}" r="${40 * s}" fill="#62c462"/>`;

const pine = (x, g, s = 1, snow = false) => {
  const green = '#3f9e58';
  let t =
    `<rect x="${x - 9 * s}" y="${g - 22 * s}" width="${18 * s}" height="${30 * s}" fill="#8a5a33"/>` +
    `<polygon points="${x},${g - 150 * s} ${x - 52 * s},${g - 60 * s} ${x + 52 * s},${g - 60 * s}" fill="${green}"/>` +
    `<polygon points="${x},${g - 110 * s} ${x - 44 * s},${g - 28 * s} ${x + 44 * s},${g - 28 * s}" fill="${green}"/>`;
  if (snow) {
    t += `<polygon points="${x},${g - 150 * s} ${x - 24 * s},${g - 108 * s} ${x + 24 * s},${g - 108 * s}" fill="#fff"/>` +
         `<polygon points="${x},${g - 110 * s} ${x - 22 * s},${g - 74 * s} ${x + 22 * s},${g - 74 * s}" fill="#fff"/>`;
  }
  return t;
};

const star = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6b0"/>`;

const balloon = (x, y, c) =>
  `<line x1="${x}" y1="${y + 36}" x2="${x}" y2="${y + 120}" stroke="#cfcfcf" stroke-width="2"/>` +
  `<ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${c}"/>` +
  `<polygon points="${x},${y + 30} ${x - 5},${y + 42} ${x + 5},${y + 42}" fill="${c}"/>`;

const flower = (x, g, c) =>
  `<line x1="${x}" y1="${g}" x2="${x}" y2="${g - 26}" stroke="#3a9a3a" stroke-width="4"/>` +
  `<g fill="${c}"><circle cx="${x}" cy="${g - 34}" r="7"/><circle cx="${x - 8}" cy="${g - 30}" r="7"/>` +
  `<circle cx="${x + 8}" cy="${g - 30}" r="7"/><circle cx="${x - 8}" cy="${g - 40}" r="7"/>` +
  `<circle cx="${x + 8}" cy="${g - 40}" r="7"/></g><circle cx="${x}" cy="${g - 35}" r="5" fill="#ffd84d"/>`;

const bat = (x, y, s = 1) =>
  `<g fill="#160d2b"><ellipse cx="${x}" cy="${y}" rx="${6 * s}" ry="${8 * s}"/>` +
  `<path d="M${x} ${y} L${x - 34 * s} ${y - 14 * s} L${x - 22 * s} ${y + 2 * s} L${x - 30 * s} ${y + 12 * s} Z"/>` +
  `<path d="M${x} ${y} L${x + 34 * s} ${y - 14 * s} L${x + 22 * s} ${y + 2 * s} L${x + 30 * s} ${y + 12 * s} Z"/></g>`;

const ghost = (x, y, s = 1) =>
  `<g>` +
  `<path d="M${x - 34 * s} ${y} a${34 * s} ${40 * s} 0 0 1 ${68 * s} 0 L${x + 34 * s} ${y + 58 * s} ` +
  `q ${-11 * s} ${18 * s} ${-22.6 * s} 0 q ${-11 * s} ${18 * s} ${-22.6 * s} 0 q ${-11 * s} ${18 * s} ${-22.6 * s} 0 Z" ` +
  `fill="#f6f7ff" opacity="0.94"/>` +
  `<circle cx="${x - 12 * s}" cy="${y + 4 * s}" r="${5 * s}" fill="#333"/>` +
  `<circle cx="${x + 12 * s}" cy="${y + 4 * s}" r="${5 * s}" fill="#333"/>` +
  `<ellipse cx="${x}" cy="${y + 20 * s}" rx="${6 * s}" ry="${8 * s}" fill="#333"/></g>`;

const pumpkin = (x, g, s = 1) =>
  `<g><ellipse cx="${x}" cy="${g - 26 * s}" rx="${42 * s}" ry="${34 * s}" fill="#ff8a1e"/>` +
  `<ellipse cx="${x - 18 * s}" cy="${g - 26 * s}" rx="${20 * s}" ry="${33 * s}" fill="#ff7a0a"/>` +
  `<ellipse cx="${x + 18 * s}" cy="${g - 26 * s}" rx="${20 * s}" ry="${33 * s}" fill="#ff7a0a"/>` +
  `<rect x="${x - 4 * s}" y="${g - 66 * s}" width="${8 * s}" height="${14 * s}" fill="#5a8a3a"/>` +
  `<polygon points="${x - 22 * s},${g - 32 * s} ${x - 8 * s},${g - 32 * s} ${x - 15 * s},${g - 20 * s}" fill="#3a2410"/>` +
  `<polygon points="${x + 22 * s},${g - 32 * s} ${x + 8 * s},${g - 32 * s} ${x + 15 * s},${g - 20 * s}" fill="#3a2410"/>` +
  `<path d="M${x - 20 * s} ${g - 8 * s} l${8 * s} ${-8 * s} l${8 * s} ${8 * s} l${8 * s} ${-8 * s} l${8 * s} ${8 * s}" ` +
  `fill="none" stroke="#3a2410" stroke-width="${4 * s}"/></g>`;

// 観覧車
const ferris = (cx, cy, r, g) => {
  const cols = ['#ff5d73', '#ffd24d', '#56c2ff', '#7bd66a', '#c08bff', '#ff9a4d', '#5de0c0', '#ff7ab0'];
  let spokes = '', cabins = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * Math.PI / 180;
    const x = (cx + Math.cos(a) * r).toFixed(0), y = (cy + Math.sin(a) * r).toFixed(0);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#9aa0b0" stroke-width="5"/>`;
    cabins += `<rect x="${x - 14}" y="${+y - 12}" width="28" height="24" rx="6" fill="${cols[i]}" stroke="#5a6070" stroke-width="2"/>`;
  }
  return `<line x1="${cx - 70}" y1="${g}" x2="${cx}" y2="${cy}" stroke="#7a8090" stroke-width="9"/>` +
    `<line x1="${cx + 70}" y1="${g}" x2="${cx}" y2="${cy}" stroke="#7a8090" stroke-width="9"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#6a7080" stroke-width="7"/>` +
    spokes + cabins + `<circle cx="${cx}" cy="${cy}" r="14" fill="#5a6070"/>`;
};

// 旗飾り(バンティング)
const bunting = (y) => {
  const cols = ['#ff5d73', '#ffd24d', '#56c2ff', '#7bd66a', '#c08bff'];
  let s = `<path d="M0 ${y} Q500 ${y + 40} 1000 ${y}" fill="none" stroke="#fff" stroke-width="3"/>`;
  for (let i = 0; i < 20; i++) {
    const x = 25 + i * 50;
    const dy = Math.round(Math.sin((x / 1000) * Math.PI) * 40);
    s += `<polygon points="${x - 16},${y + dy} ${x + 16},${y + dy} ${x},${y + dy + 26}" fill="${cols[i % cols.length]}"/>`;
  }
  return s;
};

// ビル(窓のグリッド付き)
const building = (x, y, w, h, color) => {
  let win = '';
  for (let yy = y + 24; yy <= y + h - 30; yy += 40) {
    for (let xx = x + 16; xx <= x + w - 28; xx += 34) {
      win += `<rect x="${xx}" y="${yy}" width="18" height="22" rx="2" fill="#fff6c9"/>`;
    }
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>${win}`;
};

const scatter = (fn, n, x0, x1, y0, y1, seed = 1) => {
  // 疑似乱数で点を散らす(描画は決まった配置)
  let s = '', r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    s += fn(Math.round(x0 + rnd() * (x1 - x0)), Math.round(y0 + rnd() * (y1 - y0)), i);
  }
  return s;
};

// ============================================================
//  シーン定義
// ============================================================
export const SCENES = [
  // 公園
  {
    id: 'park', label: 'こうえん', type: 'scene', base: '#bfe8ff',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#bfe8ff"/>` +
      `<rect y="470" width="${W}" height="250" fill="#8fd16a"/>` +
      `<rect y="470" width="${W}" height="16" fill="#7cc456"/>` +
      sun(135, 120) + cloud(770, 120) + cloud(560, 90, 0.75) +
      `<path d="M440,720 Q475,560 455,486 L560,486 Q545,560 600,720 Z" fill="#efdca6"/>` +
      tree(170, 520, 1.15) + tree(860, 515, 1.0) +
      flower(330, 600, '#ff5d73') + flower(380, 640, '#c08bff') + flower(690, 620, '#ffd24d') +
      flower(740, 660, '#56c2ff')
    ),
  },
  // 遊園地
  {
    id: 'amuse', label: 'ゆうえんち', type: 'scene', base: '#ffe3f1',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#ffe3f1"/>` +
      `<rect y="520" width="${W}" height="200" fill="#bfe0a8"/>` +
      bunting(30) + cloud(520, 150, 0.8) +
      ferris(250, 320, 150, 520) +
      // ビッグトップ(テント)
      `<rect x="660" y="430" width="220" height="100" fill="#fff2e0"/>` +
      `<polygon points="770,300 650,440 890,440" fill="#e8504e"/>` +
      `<polygon points="770,300 712,440 770,440" fill="#ffd24d"/>` +
      `<polygon points="770,300 828,440 770,440" fill="#56b8e0"/>` +
      `<rect x="745" y="470" width="50" height="60" rx="6" fill="#e8504e"/>` +
      `<polygon points="770,300 762,288 778,288" fill="#7bd66a"/>` +
      balloon(540, 360, '#ff5d73') + balloon(590, 330, '#56c2ff') + balloon(500, 330, '#ffd24d')
    ),
  },
  // うみ・ビーチ
  {
    id: 'sea', label: 'うみ', type: 'scene', base: '#cdeffd',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#cdeffd"/>` +
      sun(840, 120) + cloud(220, 120, 0.9) +
      `<path d="M0,400 Q120,380 250,400 T500,400 T750,400 T1000,400 L1000,560 L0,560 Z" fill="#34b6e0"/>` +
      `<rect y="540" width="${W}" height="20" fill="#2aa6d0"/>` +
      `<rect y="558" width="${W}" height="180" fill="#f3e2a8"/>` +
      // ヨット
      `<polygon points="430,400 430,300 510,400" fill="#ffffff"/>` +
      `<polygon points="438,400 438,320 388,400" fill="#ff5d73"/>` +
      `<rect x="408" y="400" width="80" height="20" rx="8" fill="#8a5a33"/>` +
      // ヤシの木
      `<path d="M880,720 Q865,560 885,470" fill="none" stroke="#9a6b3f" stroke-width="20" stroke-linecap="round"/>` +
      `<g fill="#3f9e58"><ellipse cx="885" cy="455" rx="70" ry="20"/><ellipse cx="885" cy="455" rx="20" ry="60"/>` +
      `<ellipse cx="855" cy="430" rx="55" ry="18" transform="rotate(-35 855 430)"/>` +
      `<ellipse cx="915" cy="430" rx="55" ry="18" transform="rotate(35 915 430)"/></g>` +
      // ビーチボール
      `<g transform="translate(300 640)"><circle r="34" fill="#fff"/>` +
      `<path d="M0,-34 A34 34 0 0 1 29,17 L0,0 Z" fill="#ff5d73"/>` +
      `<path d="M29,17 A34 34 0 0 1 -29,17 L0,0 Z" fill="#ffd24d"/>` +
      `<path d="M-29,17 A34 34 0 0 1 0,-34 L0,0 Z" fill="#56c2ff"/></g>`
    ),
  },
  // うちゅう
  {
    id: 'space', label: 'うちゅう', type: 'scene', base: '#0e1736',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#0e1736"/>` +
      scatter((x, y) => star(x, y, 2 + (x % 3)), 60, 20, 980, 20, 700, 7) +
      // 土星
      `<g transform="translate(780 180)"><ellipse cx="0" cy="0" rx="95" ry="22" fill="none" stroke="#d9b36b" stroke-width="10"/>` +
      `<circle r="58" fill="#e8a94d"/><ellipse cx="0" cy="0" rx="95" ry="22" fill="none" stroke="#f0d089" stroke-width="4"/></g>` +
      // 月
      `<g transform="translate(170 200)"><circle r="60" fill="#cfd6e6"/>` +
      `<circle cx="-20" cy="-12" r="12" fill="#b6bed1"/><circle cx="18" cy="14" r="16" fill="#b6bed1"/>` +
      `<circle cx="14" cy="-24" r="8" fill="#b6bed1"/></g>` +
      // 月面(下)
      `<path d="M0,640 Q250,580 520,630 T1000,620 L1000,720 L0,720 Z" fill="#3a4468"/>` +
      // 小さな星(光)
      `<g fill="#fff"><polygon points="500,120 506,138 524,144 506,150 500,168 494,150 476,144 494,138"/></g>`
    ),
  },
  // まち
  {
    id: 'town', label: 'まち', type: 'scene', base: '#bfe8ff',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#bfe8ff"/>` +
      sun(120, 110) + cloud(740, 120, 0.9) +
      // ビル群(窓つき)
      building(60, 380, 120, 220, '#ff9a8a') +
      building(200, 300, 130, 300, '#7fb6e0') +
      building(350, 420, 110, 180, '#ffce6a') +
      building(560, 340, 130, 260, '#9ad08a') +
      building(710, 280, 120, 320, '#c79ae0') +
      building(850, 400, 110, 200, '#ff9a8a') +
      // 道路
      `<rect y="600" width="${W}" height="120" fill="#5c6270"/>` +
      `<g fill="#ffd84d">` +
      `<rect x="40" y="654" width="60" height="10"/><rect x="180" y="654" width="60" height="10"/>` +
      `<rect x="320" y="654" width="60" height="10"/><rect x="460" y="654" width="60" height="10"/>` +
      `<rect x="600" y="654" width="60" height="10"/><rect x="740" y="654" width="60" height="10"/>` +
      `<rect x="880" y="654" width="60" height="10"/></g>`
    ),
  },
  // ぼくじょう
  {
    id: 'farm', label: 'ぼくじょう', type: 'scene', base: '#bfe8ff',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#bfe8ff"/>` +
      sun(860, 110) + cloud(230, 120, 0.85) +
      `<path d="M0,470 Q260,400 540,470 T1000,460 L1000,720 L0,720 Z" fill="#8fd16a"/>` +
      `<path d="M0,560 Q300,510 620,560 T1000,560 L1000,720 L0,720 Z" fill="#7cc456"/>` +
      // 納屋
      `<g><rect x="120" y="420" width="220" height="150" fill="#d6553f"/>` +
      `<polygon points="110,420 230,350 350,420" fill="#b8442f"/>` +
      `<rect x="200" y="480" width="60" height="90" fill="#f3e2a8"/>` +
      `<line x1="200" y1="480" x2="260" y2="570" stroke="#d6553f" stroke-width="6"/>` +
      `<line x1="260" y1="480" x2="200" y2="570" stroke="#d6553f" stroke-width="6"/></g>` +
      // フェンス
      `<g stroke="#caa06a" stroke-width="10" stroke-linecap="round">` +
      `<line x1="560" y1="560" x2="560" y2="620"/><line x1="660" y1="560" x2="660" y2="620"/>` +
      `<line x1="760" y1="560" x2="760" y2="620"/><line x1="860" y1="560" x2="860" y2="620"/>` +
      `<line x1="960" y1="560" x2="960" y2="620"/>` +
      `<line x1="540" y1="578" x2="980" y2="578"/><line x1="540" y1="602" x2="980" y2="602"/></g>` +
      flower(420, 660, '#ff5d73') + flower(470, 690, '#ffd24d')
    ),
  },
  // ゆきのくに
  {
    id: 'snow', label: 'ゆき', type: 'scene', base: '#dcecff',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#dcecff"/>` +
      sun(150, 110, 50, '#ffe9a3') +
      `<path d="M0,520 Q260,440 540,520 T1000,510 L1000,720 L0,720 Z" fill="#ffffff"/>` +
      `<path d="M0,600 Q300,550 640,600 T1000,600 L1000,720 L0,720 Z" fill="#eef4ff"/>` +
      pine(770, 600, 1.0, true) + pine(880, 580, 0.8, true) +
      // ゆきだるま
      `<g><circle cx="380" cy="600" r="52" fill="#fff" stroke="#d3e0f0" stroke-width="3"/>` +
      `<circle cx="380" cy="520" r="38" fill="#fff" stroke="#d3e0f0" stroke-width="3"/>` +
      `<circle cx="370" cy="512" r="4" fill="#333"/><circle cx="390" cy="512" r="4" fill="#333"/>` +
      `<polygon points="380,522 405,528 380,534" fill="#ff8a1e"/>` +
      `<circle cx="380" cy="588" r="4" fill="#333"/><circle cx="380" cy="606" r="4" fill="#333"/>` +
      `<line x1="340" y1="540" x2="300" y2="520" stroke="#9a6b3f" stroke-width="5"/>` +
      `<line x1="420" y1="540" x2="460" y2="520" stroke="#9a6b3f" stroke-width="5"/></g>` +
      scatter((x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff"/>`, 60, 20, 980, 20, 480, 5)
    ),
  },
  // おばけ(ちょっとこわい)
  {
    id: 'spooky', label: 'おばけ', type: 'scene', base: '#241340',
    svg: wrap(
      `<rect width="${W}" height="${H}" fill="#241340"/>` +
      `<rect width="${W}" height="260" fill="#1c0f33"/>` +
      scatter((x, y) => star(x, y, 2), 40, 20, 980, 20, 360, 3) +
      // 満月
      `<g transform="translate(800 150)"><circle r="66" fill="#f2efce"/>` +
      `<circle cx="-22" cy="-10" r="10" fill="#e3dfac"/><circle cx="20" cy="18" r="14" fill="#e3dfac"/>` +
      `<circle cx="16" cy="-26" r="7" fill="#e3dfac"/></g>` +
      bat(540, 150, 1.2) + bat(640, 110, 0.9) + bat(360, 200, 0.8) +
      // 地面
      `<path d="M0,560 Q250,520 520,555 T1000,550 L1000,720 L0,720 Z" fill="#180e2b"/>` +
      // 枯れ木
      `<g stroke="#0e0820" stroke-width="14" stroke-linecap="round" fill="none">` +
      `<path d="M150,580 L150,420"/><path d="M150,470 L100,420"/><path d="M150,500 L205,450"/>` +
      `<path d="M150,440 L120,400"/><path d="M150,440 L185,405"/></g>` +
      ghost(450, 470, 1.1) + pumpkin(640, 600, 1.1)
    ),
  },
];

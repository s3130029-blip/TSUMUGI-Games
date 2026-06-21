// アイスの種類定義（データのみ・ロジックは持たない）
// 種類を増減するときは、この配列に項目を足す／削るだけでよい。
//   id    : 一意の識別子（重複させない）
//   name  : 画面に出す名前
//   color : 見た目の色
var FLAVORS = [
  { id: 'vanilla',    name: 'バニラ',     color: '#f7e7b4' },
  { id: 'chocolate',  name: 'チョコ',     color: '#7a4a25' },
  { id: 'strawberry', name: 'いちご',     color: '#ff7fa6' },
  { id: 'matcha',     name: 'まっちゃ',   color: '#8ec641' },
  { id: 'soda',       name: 'ソーダ',     color: '#5ec8f0' },
  { id: 'grape',      name: 'ぶどう',     color: '#a06cd5' },
  { id: 'orange',     name: 'オレンジ',   color: '#ff9f43' },
  { id: 'mint',       name: 'ミント',     color: '#83e8c6' },
  { id: 'lemon',      name: 'レモン',     color: '#ffd83d' },
  { id: 'cherry',     name: 'さくらんぼ', color: '#ff5d6c' }
];

// id から味データを取り出すヘルパー
function getFlavor(id) {
  for (var i = 0; i < FLAVORS.length; i++) {
    if (FLAVORS[i].id === id) return FLAVORS[i];
  }
  return null;
}

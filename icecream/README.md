# アイスクリームやさんゲーム 🍦

お客さんの注文（見本）どおりに、コーンへアイスをドラッグして積み上げる、子供向けの簡単なゲームです。
HTML / CSS / JavaScript だけで動く**静的Webアプリ**で、ビルドや外部ライブラリは不要です。

## あそびかた
1. 上の「これ ちょうだい！」の見本を見る。
2. 下のパレットから同じ味のアイスを、コーンの上にドラッグして置く。
3. 下から順番に見本どおりに積めたらクリア！🎉「つぎ →」で次の注文へ。
- 置きまちがえたら、積んだアイスを**タップ**すると外せます（そこから上が消えます）。
- 「やりなおし」ボタンで全部やり直せます。

## 動かし方（ローカル）
- `index.html` をダブルクリックしてブラウザで開くだけ。
- iPad で確認するときは、同じフォルダを GitHub Pages に置いた URL を Safari で開きます。

## GitHub Pages で公開
- このフォルダごと、リポジトリ `s3130029-blip/TSUMUGI-Games` の `icecream/` サブフォルダに置きます。
- パスはすべて相対指定なので、`https://s3130029-blip.github.io/TSUMUGI-Games/icecream/` でそのまま動きます。
- リポジトリのルートや他のゲームには手を加えません。

## フォルダ構成
```
icecream/
├─ index.html
├─ css/style.css
├─ js/
│  ├─ data/flavors.js   … アイスの種類（色・名前）
│  ├─ order.js          … 注文のランダム生成
│  ├─ render.js         … 画面描画
│  ├─ input.js          … タッチ操作（ドラッグ＆ドロップ）
│  ├─ effects.js        … クリア演出
│  └─ main.js           … 全体の組み立て
├─ assets/              … 画像・音（今は未使用）
├─ docs/requirements.md … 要件定義
├─ task.md              … 作業チェックリスト
├─ CLAUDE.md            … 開発ルール
└─ README.md
```

## カスタマイズ
- **アイスを増やす**：`js/data/flavors.js` の配列に1行足すだけ。
- **段数を変える**：`js/main.js` 上部の `START_LEN` / `MIN_LEN` / `MAX_CAP`。
- **置きやすさを変える**：`js/input.js` の `pad`（ドロップ判定の広さ）。

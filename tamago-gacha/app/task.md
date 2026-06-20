# 開発タスク — タマゴガチャ（tamago-gacha）

> 仕様の正本は [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)、行動規約は [CLAUDE.md](CLAUDE.md)。
> 各フェーズ完了時に `npm run dev` で遊べる・型エラー0・テスト全緑を維持する。

## 前提（確定事項）
- 技術：TypeScript + Vite + Vitest（フレームワーク不使用）。
- 描画方針：**アプリ全体の画面・レイアウトは素のDOM＋CSS（flex/grid）**。**タマゴ本体＋ひび割れのみSVGパス**で描き、動きは `<g>` への CSS `transform`（GPU合成）。`<filter>`・`d`属性アニメは不使用。ひびは `stroke-dasharray`/`stroke-dashoffset`（`pathLength`）で広げる。キラキラは30〜40未満ならCSS、超えるならCanvas。
- 公開：`s3130029-blip/TSUMUGI-Games` の `tamago-gacha/` サブフォルダ。`base="/TSUMUGI-Games/tamago-gacha/"`。
- 抽選：シード可能な擬似乱数（mulberry32）経由。`Math.random()` を抽選ロジックに直接使わない。
- 対象：iPad 横（iOS Safari）最優先、子ども向け。縦でも崩れない。サーバー/外部通信/課金/広告なし。

---

## フェーズ1：MVP（メイン体験）  ← ほぼ完了（実機確認のみ残）

- [x] プロジェクト雛形：`package.json` / `tsconfig.json`（strict）/ `vite.config.ts`（base+vitest）/ `.gitignore`
- [x] `index.html`：viewport（`viewport-fit=cover`）、ピンチ拡大・スクロール・長押しメニュー抑制、エントリ読込
- [x] `src/config.ts`：演出時間・抽選確率などの定数を一箇所に集約
- [x] `src/data/items.ts`：仮アイテム23種（動物/乗り物/食べ物、絵文字）。`assetUrl` 差し替え可能な設計
- [x] `src/core/prng.ts`：mulberry32（seedable）＋ `tests/prng.test.ts`（同seed再現・分布）
- [x] `src/core/gacha.ts`：重み付き抽選（純粋関数）＋ `tests/gacha.test.ts`（再現性・分布・境界値）
- [x] `tests/items.test.ts`：アイテムマスタ整合性（ID一意・必須フィールド欠落）
- [x] `src/ui/svg-egg.ts`：タマゴ＋ひびのSVGマークアップ（上半分/下半分/ひび線を `<g>` 分割、`pathLength`）
- [x] `src/ui/`：`app.ts`（統括）/ `gacha-screen.ts`（演出①〜⑧、SVGグループへの transform 制御）/ `effects/sparkle.ts`（キラキラ）
- [x] `src/styles/`：`base.css`（リセット・誤操作抑制）/ `gacha.css`（画面・結果・キラキラ）/ `egg.css`（SVG卵の見た目とアニメ。`transform-box: fill-box`）。`transform`/`opacity` 中心
- [x] 連打対策：演出再生中の多重タップを無視（破綻しない）
- [x] `prefers-reduced-motion` 尊重（控えめモード）
- [x] `npm run dev`／`npm run build` 動作確認・型エラー0・テスト全緑（21件）・base反映を確認
- [x] `README.md`（Pages公開の手動手順／サブフォルダ運用メモを記載）
- [ ] `.github/workflows/deploy.yml`（自動デプロイ。公開リポジトリ構成の確認後に用意）
- [ ] **iPad 横 Safari 実機スモークテスト**（※開発環境では実行不可＝ユーザー確認項目）

---

## フェーズ2：レアリティ  ← 完了（音=ジングルはフェーズ5）
- [x] レア度3段階の重み付き抽選（確率は `config.ts` の `RARITY_WEIGHTS`）
- [x] rare / superRare の専用演出（溜め時間・フラッシュ色・虹オーバーレイ・粒子増量/色・レアバッジ）
- [ ] 専用効果音/ジングル（Web Audio）→ フェーズ5でまとめて実装

## フェーズ3：図鑑・コレクション  ← 完了（実機確認のみ残）
- [x] `core/save.ts`（localStorage 入出力・破損フォールバック・`recordCollect`）/ `core/stats.ts`（コンプ率・カテゴリ別集計・ダブり）。Storage 注入でテスト可能に
- [x] `ui/zukan-screen.ts`：グリッド・未取得は「？」のみ表示（名前/カテゴリ/レア度を伏せる ※ユーザー決定）・カテゴリ別フィルタ・コンプリート率・全コンプお祝い
- [x] `ui/detail-modal.ts`：拡大・日本語名/英語名・レア度・取得個数（読み上げボタンはフェーズ4）
- [x] `ui/app.ts`：セーブの簡易ストア化＋ガチャ↔図鑑の画面遷移。ガチャ取得を `recordCollect`→`saveSave` で永続化
- [x] ガチャ結果に「NEW!」/「○こめ！」表示・「ずかん」ボタン追加
- [x] `tests/save.test.ts`（17件）/ `tests/stats.test.ts`（9件）。型エラー0・テスト全緑（47件）・build 確認
- [ ] **iPad 横 Safari 実機確認**（図鑑スクロール・保存の永続化／※開発環境では実行不可＝ユーザー確認項目）

### フェーズ3 仮決め（フェーズ5で対応予定）
- 永続的な NEW バッジ（既読で消す未読フラグ管理）は未実装。今回は取得直後の「NEW!」表示のみ。
- 図鑑からの読み上げ（フェーズ4）、データリセット・設定（フェーズ5）。

## フェーズ4：日英読み上げ
- [ ] `audio/speech.ts`：Web Speech API（`voiceschanged` 待ち・フォールバック）
- [ ] 図鑑詳細タップで 日本語名 → 英語名 の順に読み上げ

## フェーズ5：仕上げ
- [ ] `audio/sfx.ts`：Web Audio 合成音（タップ/パカッ/キラーン/レアジングル）
- [ ] NEWバッジ（仮決め：図鑑詳細を開いたら消える）・設定画面・データリセット
- [ ] PWA（manifest・Service Worker・オフライン・ホーム画面追加）
- [ ] アクセシビリティ・演出の磨き込み

### UI改善メモ（仕上げでまとめて対応）
- [ ] **タマゴの殻の色を毎回変える**（現状は毎回同じで単調）。`svg-egg.ts` のグラデを数色用意し、待機タマゴごとに rng で抽選。※ユーザー要望
- [ ] その他、全体完成後に細かいUI調整をまとめて実施。

---

## 仮決めメモ（要確認候補）
- NEWバッジの消滅：図鑑で詳細を開いたら消す（未読フラグ管理）。
- 画面向き：横最優先＋縦も崩れない。強制回転や「横にして」警告は出さない。
- フェーズ1の抽選：器は重み対応だが、レア専用演出はフェーズ2で追加。

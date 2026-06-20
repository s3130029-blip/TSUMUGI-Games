# タマゴガチャ（tamago-gacha）

ブラウザで動く、子ども向けタマゴガチャ（カプセルトイ）ゲーム。
タマゴをタップ → ガタガタ → ひび → パカッ → 中からモノ（絵文字）が生まれる、を中心とした演出重視の作品です。

- 完全サーバーレス（ログイン・課金・広告・外部通信なし）。
- **iPad 横画面（iOS Safari）での快適なプレイを最優先**。
- 仕様の正本は [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)、開発の行動規約は [CLAUDE.md](CLAUDE.md)。

## 動作環境

- Node.js 18 以上（開発時のみ。動作確認は Node 24 / npm 11）。
- 公開後の利用にビルドやサーバーは不要（静的ファイルのみ）。

## セットアップ

```bash
npm install
```

## コマンド

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバを起動（ホットリロード） |
| `npm run build` | 本番ビルド（型チェック込み）。`dist/` に出力 |
| `npm run preview` | ビルド結果をローカル配信して確認 |
| `npm run test` | Vitest（ウォッチ） |
| `npm run test:run` | Vitest を1回実行 |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |

開発サーバ起動後のURLは `http://localhost:5173/TSUMUGI-Games/tamago-gacha/` です
（`base` をサブパスに設定しているため、ルートではなくこのパスになります）。

## 遊び方

- 画面中央の大きなタマゴをタップするとガチャが始まります。
- ガタガタ揺れて → ひびが入り → パカッと割れて → 中からモノが出てきます。
- 結果が出たら画面をタップすると、次のタマゴに戻ります。
- 連打しても演出は破綻しません（演出中のタップは無視されます）。

## プロジェクト構成

```
src/
├── main.ts            # エントリ
├── config.ts          # 調整値（確率・演出時間・音量）を集約
├── data/items.ts      # アイテムマスタ（型＋初期データ）
├── core/              # 純粋関数（テスト対象）
│   ├── prng.ts        # シード可能な擬似乱数（mulberry32）
│   ├── gacha.ts       # 重み付き抽選
│   ├── save.ts        # localStorage 保存/読込・NEW判定(seen)
│   └── stats.ts       # コンプ率・カテゴリ別集計・未確認(NEW)判定
├── audio/             # 副作用（実機で聴取確認）
│   ├── sfx.ts         # 効果音（Web Audio 合成音）
│   └── speech.ts      # 日英読み上げ（Web Speech API）
├── ui/                # 画面・演出（DOM操作）
│   ├── app.ts         # 画面統括・セーブ/設定ストア
│   ├── gacha-screen.ts# タマゴ演出シーケンス
│   ├── zukan-screen.ts# 図鑑（コレクション）
│   ├── detail-modal.ts# アイテム詳細＋読み上げ
│   ├── settings-modal.ts # 設定（読み上げ/効果音/ひかえめ・リセット）
│   ├── svg-egg.ts     # タマゴ＋ひびのSVG・殻色パレット
│   └── effects/sparkle.ts
└── styles/            # base / gacha / egg / zukan / settings の各CSS
tests/                 # Vitest（prng / gacha / items / save / stats / speech）
```

抽選などの乱数はすべてシード可能な擬似乱数（`core/prng.ts`）を経由し、`Math.random()` は
抽選ロジックに直接使っていません。確率分布・再現性・境界値は Vitest で検証しています。

## デプロイ（GitHub Pages）

公開先は **`s3130029-blip/TSUMUGI-Games` リポジトリの `tamago-gacha/` サブフォルダ**です。
`vite.config.ts` の `base` を `"/TSUMUGI-Games/tamago-gacha/"` に設定済みなので、
公開URLは次になります：

```
https://s3130029-blip.github.io/TSUMUGI-Games/tamago-gacha/
```

### 手動デプロイ手順（最もシンプル・確実）

> 他のゲームやリポジトリのルートを壊さないよう、`tamago-gacha/` 配下だけを更新します。

1. ビルドする。
   ```bash
   npm run build
   ```
2. 生成された `dist/` の**中身**を、`TSUMUGI-Games` リポジトリの `tamago-gacha/` フォルダにコピーする
   （`tamago-gacha/index.html` と `tamago-gacha/assets/...` になるように）。
3. `TSUMUGI-Games` リポジトリで commit & push する。
4. `TSUMUGI-Games` の Pages が「main ブランチ / ルート」公開設定なら、上記URLに反映される。

### 注意

- リポジトリ名やサブフォルダ名を変える場合は、`vite.config.ts` の `base` も必ず合わせる
  （ここがズレると本番でアセットが 404 になる）。
- GitHub Actions による自動デプロイも可能ですが、公開先が別リポジトリのサブフォルダのため、
  リポジトリ構成（モノレポ化するか、別リポジトリへ push する PAT を使うか）を決める必要があります。
  希望があればその前提でワークフロー（`.github/workflows/`）を用意します。

## 開発状況

- **フェーズ1〜5まで実装完了**（型チェック0・テスト全緑62件・ローカルでのビルド/開発サーバ動作を確認済み）。
  - 1=MVP（タマゴ演出）／2=レアリティ／3=図鑑・localStorage保存／4=日英読み上げ／
    5=仕上げ（効果音・設定・NEWバッジ・殻色バリエーション・アクセシビリティ）。
- **PWA対応は今回見送り**（必要になれば manifest／Service Worker を別途追加）。
- 詳細な進捗は [task.md](task.md) を参照。

### 未確認事項（正直に明記）

- **iPad 横（iOS Safari）実機でのスモークテストは未実施**です。
  SVG描画・タッチ操作・スクロール抑制・全画面挙動・**効果音の発音・読み上げ**は
  iOS 固有の差があるため、実機での目視/聴取確認が完了条件になります（開発環境では実行できません）。

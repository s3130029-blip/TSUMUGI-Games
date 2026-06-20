// ビルド成果物（app/dist の中身）を、公開フォルダ tamago-gacha/ の直下に配置する。
// 公開先リポジトリ TSUMUGI-Games は「ブランチ(main)のルートから配信」する運用で、
// 各ゲームのサブフォルダに静的ファイルを直接置く（Actions なし）。
// この構成では tamago-gacha/index.html・tamago-gacha/assets/ が公開エントリになる。
//
// 配置イメージ:
//   tamago-gacha/
//   ├── index.html   ← ここに出力（公開される）
//   ├── assets/      ← ここに出力（公開される）
//   └── app/         ← このスクリプトを含むソース一式（dist はこの中で生成）
//
// 単体の Gacha リポジトリ（TSUMUGI-Games の外）で実行した場合は、1つ上が
// 公開フォルダではないため配置されない可能性がある点に注意（app/ 配下での利用を想定）。

import { rm, cp, access } from "node:fs/promises";

const distDir = new URL("../dist/", import.meta.url); // app/dist/
const publicDir = new URL("../../", import.meta.url); // app の親 = tamago-gacha/

async function exists(url) {
  try {
    await access(url);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(distDir))) {
  console.error("dist が見つかりません。先に `npm run build` を実行してください。");
  process.exit(1);
}

// 古い公開物を掃除（index.html と assets/ のみ。app/ や他ゲームには触れない）
await rm(new URL("index.html", publicDir), { force: true });
await rm(new URL("assets", publicDir), { recursive: true, force: true });

// 新しいビルド成果物を配置
await cp(distDir, publicDir, { recursive: true });

console.log("公開物を tamago-gacha/ 直下に配置しました（index.html / assets）。");

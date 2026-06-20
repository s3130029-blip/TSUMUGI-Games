import { defineConfig } from "vitest/config";

// GitHub Pages のサブパス公開（s3130029-blip/TSUMUGI-Games の tamago-gacha/ サブフォルダ）に
// 合わせて base を設定する。dev でも build でもこのパスを基準にする。
// 参照: CLAUDE.md §13 / REQUIREMENTS.md 2.4
export default defineConfig({
  base: "/TSUMUGI-Games/tamago-gacha/",
  test: {
    // フェーズ1の対象（prng / gacha / items）は純粋関数なので node 環境で十分。
    // DOM を使うテスト（図鑑など）を追加する際は jsdom を導入する。
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});

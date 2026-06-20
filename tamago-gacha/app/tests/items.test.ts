import { describe, it, expect } from "vitest";
import { ITEMS } from "../src/data/items";
import type { Category, Rarity } from "../src/data/items";

const CATEGORIES: readonly Category[] = ["animal", "vehicle", "food"];
const RARITIES: readonly Rarity[] = ["common", "rare", "superRare"];

describe("アイテムマスタの整合性", () => {
  it("ID は一意である", () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("必須フィールドが欠落していない", () => {
    for (const item of ITEMS) {
      expect(item.id, `id 欠落: ${JSON.stringify(item)}`).toBeTruthy();
      expect(item.nameJa, `nameJa 欠落: ${item.id}`).toBeTruthy();
      expect(item.nameEn, `nameEn 欠落: ${item.id}`).toBeTruthy();
      expect(item.emoji, `emoji 欠落: ${item.id}`).toBeTruthy();
      expect(CATEGORIES, `不正な category: ${item.id}`).toContain(item.category);
      expect(RARITIES, `不正な rarity: ${item.id}`).toContain(item.rarity);
    }
  });

  it("各カテゴリ・各レア度が最低1つ存在する（抽選が成立する）", () => {
    for (const c of CATEGORIES) {
      expect(ITEMS.some((i) => i.category === c), `カテゴリ不足: ${c}`).toBe(true);
    }
    for (const r of RARITIES) {
      expect(ITEMS.some((i) => i.rarity === r), `レア度不足: ${r}`).toBe(true);
    }
  });

  it("フェーズ1として十分な種類数がある（12種以上）", () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(12);
  });
});

import { describe, it, expect } from "vitest";
import { collectionStats, isCollected, itemCount, dupeCount } from "../src/core/stats";
import { defaultSave, recordCollect, type SaveData } from "../src/core/save";
import { ITEMS } from "../src/data/items";
import type { ItemDef } from "../src/data/items";

/** 指定IDを指定個数だけ取得したセーブを作るヘルパ。 */
function saveWith(counts: Record<string, number>): SaveData {
  let s = defaultSave();
  for (const [id, n] of Object.entries(counts)) {
    for (let i = 0; i < n; i++) s = recordCollect(s, id, 1).save;
  }
  return s;
}

describe("isCollected / itemCount / dupeCount", () => {
  const save = saveWith({ dog: 3, cat: 1 });

  it("取得済み判定", () => {
    expect(isCollected(save, "dog")).toBe(true);
    expect(isCollected(save, "rabbit")).toBe(false);
  });

  it("個数", () => {
    expect(itemCount(save, "dog")).toBe(3);
    expect(itemCount(save, "rabbit")).toBe(0);
  });

  it("ダブり数（個数-1、未取得・1個は0）", () => {
    expect(dupeCount(save, "dog")).toBe(2);
    expect(dupeCount(save, "cat")).toBe(0);
    expect(dupeCount(save, "rabbit")).toBe(0);
  });
});

describe("collectionStats", () => {
  it("空セーブは 0 / 全種、ratio=0、未コンプ", () => {
    const s = collectionStats(defaultSave(), ITEMS);
    expect(s.collected).toBe(0);
    expect(s.total).toBe(ITEMS.length);
    expect(s.ratio).toBe(0);
    expect(s.isComplete).toBe(false);
  });

  it("一部取得：種類数で数える（ダブりは1種としてカウント）", () => {
    const s = collectionStats(saveWith({ dog: 5, cat: 1 }), ITEMS);
    expect(s.collected).toBe(2);
    expect(s.ratio).toBeCloseTo(2 / ITEMS.length, 10);
    expect(s.isComplete).toBe(false);
  });

  it("カテゴリ別の総数の合計は全種数に一致する", () => {
    const s = collectionStats(defaultSave(), ITEMS);
    const totalByCat = Object.values(s.byCategory).reduce((sum, c) => sum + (c?.total ?? 0), 0);
    expect(totalByCat).toBe(ITEMS.length);
  });

  it("カテゴリ別の取得数が正しい", () => {
    // dog は animal、car は vehicle、apple は food
    const s = collectionStats(saveWith({ dog: 1, car: 1, apple: 2 }), ITEMS);
    expect(s.byCategory.animal?.collected).toBe(1);
    expect(s.byCategory.vehicle?.collected).toBe(1);
    expect(s.byCategory.food?.collected).toBe(1);
  });

  it("全種取得で isComplete=true・ratio=1", () => {
    const all: Record<string, number> = {};
    for (const item of ITEMS as readonly ItemDef[]) all[item.id] = 1;
    const s = collectionStats(saveWith(all), ITEMS);
    expect(s.collected).toBe(ITEMS.length);
    expect(s.ratio).toBe(1);
    expect(s.isComplete).toBe(true);
  });

  it("total=0 のときは ratio=0・isComplete=false（ゼロ除算しない）", () => {
    const s = collectionStats(defaultSave(), []);
    expect(s.ratio).toBe(0);
    expect(s.isComplete).toBe(false);
  });
});

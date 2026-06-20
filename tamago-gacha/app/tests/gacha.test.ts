import { describe, it, expect } from "vitest";
import { mulberry32, type Rng } from "../src/core/prng";
import { pickWeighted, drawItem, groupByRarity } from "../src/core/gacha";
import { ITEMS } from "../src/data/items";
import type { Rarity } from "../src/data/items";
import { RARITY_WEIGHTS } from "../src/config";

/** 常に同じ値を返す Rng（境界値テスト用）。 */
const constRng = (v: number): Rng => () => v;

describe("pickWeighted", () => {
  const entries = ["a", "b", "c"] as const;
  // 重み a:1, b:1, c:2（合計4）→ 区間 a:[0,1) b:[1,2) c:[2,4)
  const weightMap: Record<string, number> = { a: 1, b: 1, c: 2 };
  const w = (e: string) => weightMap[e]!;

  it("rng=0 のとき最初の要素を返す", () => {
    expect(pickWeighted(constRng(0), entries, w)).toBe("a");
  });

  it("rng≈1 のとき最後の要素を返す", () => {
    expect(pickWeighted(constRng(0.999999), entries, w)).toBe("c");
  });

  it("累積の境界ちょうどで次の区間に入る", () => {
    // r = v * total(=4)。v=0.25 → r=1 → a の区間[0,1)に入らず b。
    expect(pickWeighted(constRng(0.25), entries, w)).toBe("b");
    // v=0.5 → r=2 → c の区間[2,4)
    expect(pickWeighted(constRng(0.5), entries, w)).toBe("c");
  });

  it("空配列は例外を投げる", () => {
    expect(() => pickWeighted(constRng(0), [], w)).toThrow();
  });

  it("重みが全て0なら均等抽選にフォールバックする（例外を投げない）", () => {
    const zero = () => 0;
    const got = pickWeighted(constRng(0.5), entries, zero);
    expect(entries).toContain(got);
  });
});

describe("groupByRarity", () => {
  it("全アイテムを過不足なくレア度別に分類する", () => {
    const g = groupByRarity(ITEMS);
    expect(g.common.length + g.rare.length + g.superRare.length).toBe(ITEMS.length);
  });
});

describe("drawItem", () => {
  it("同じシードからは同じ抽選列になる（再現性）", () => {
    const r1 = mulberry32(99);
    const r2 = mulberry32(99);
    const ids1 = Array.from({ length: 30 }, () => drawItem(r1, ITEMS).id);
    const ids2 = Array.from({ length: 30 }, () => drawItem(r2, ITEMS).id);
    expect(ids1).toEqual(ids2);
  });

  it("空アイテムは例外を投げる", () => {
    expect(() => drawItem(mulberry32(1), [])).toThrow();
  });

  it("重みを superRare のみにすると superRare だけ出る", () => {
    const r = mulberry32(5);
    const onlySuper: Record<Rarity, number> = { common: 0, rare: 0, superRare: 1 };
    for (let i = 0; i < 500; i++) {
      expect(drawItem(r, ITEMS, onlySuper).rarity).toBe("superRare");
    }
  });

  it("十分な試行で3レア度すべてが出現する", () => {
    const r = mulberry32(2024);
    const seen = new Set<Rarity>();
    for (let i = 0; i < 5000; i++) seen.add(drawItem(r, ITEMS).rarity);
    expect(seen.has("common")).toBe(true);
    expect(seen.has("rare")).toBe(true);
    expect(seen.has("superRare")).toBe(true);
  });

  it("レア度の分布が重みに概ね一致する（固定シードで決定的）", () => {
    const r = mulberry32(20260620);
    const N = 60000;
    const counts: Record<Rarity, number> = { common: 0, rare: 0, superRare: 0 };
    for (let i = 0; i < N; i++) counts[drawItem(r, ITEMS).rarity]++;

    const total = RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare + RARITY_WEIGHTS.superRare;
    const expCommon = RARITY_WEIGHTS.common / total; // 0.80
    const expRare = RARITY_WEIGHTS.rare / total; // 0.18
    const expSuper = RARITY_WEIGHTS.superRare / total; // 0.02

    // toBeCloseTo(x, 1) は |actual - x| < 0.05 を意味する（十分緩い許容）。
    expect(counts.common / N).toBeCloseTo(expCommon, 1);
    expect(counts.rare / N).toBeCloseTo(expRare, 1);
    // superRare は割合が小さいので範囲で確認
    expect(counts.superRare / N).toBeGreaterThan(expSuper * 0.5);
    expect(counts.superRare / N).toBeLessThan(expSuper * 1.5);
  });
});

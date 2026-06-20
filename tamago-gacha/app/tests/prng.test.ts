import { describe, it, expect } from "vitest";
import { mulberry32, hashSeed } from "../src/core/prng";

describe("mulberry32", () => {
  it("同じシードからは同じ列を返す（決定的）", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = Array.from({ length: 16 }, () => a());
    const seqB = Array.from({ length: 16 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("異なるシードは異なる列になる", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 16 }, () => a());
    const seqB = Array.from({ length: 16 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it("値域は [0, 1)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 2000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("hashSeed", () => {
  it("同じ文字列からは同じシードになる", () => {
    expect(hashSeed("tamago")).toBe(hashSeed("tamago"));
  });

  it("異なる文字列は異なるシードになる", () => {
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });

  it("uint32 の範囲に収まる", () => {
    const s = hashSeed("tamago-gacha");
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(0xffffffff);
  });
});

// シード可能な擬似乱数（PRNG）。
// 同じシードからは常に同じ列を返す＝決定的なので、抽選のテストを再現できる（CLAUDE.md §5）。
// 抽選ロジックでは Math.random() を直接使わず、必ずこの Rng を経由する（CLAUDE.md §6）。

/** 0 以上 1 未満の数を返す擬似乱数生成器。 */
export type Rng = () => number;

/**
 * mulberry32：32bit シードの軽量な決定的 PRNG。
 * @param seed 任意の整数（内部で uint32 化）
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 任意の文字列から uint32 のシードを作る（FNV-1a）。固定の seed 文字列を使いたい場合に。 */
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 通常プレイ用の非決定的なシードを生成する。
 * 抽選ロジックそのものではなく「シードの種」なので crypto を使う（Math.random は使わない）。
 */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! >>> 0;
}

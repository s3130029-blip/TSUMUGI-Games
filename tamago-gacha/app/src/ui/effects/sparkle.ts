// 登場時のキラキラ粒子（軽量）。個数は少なめ（既定16・最大40程度）なので CSS アニメで実装する。
// ※恒常的に40超にする場合は Canvas に切り替える（CLAUDE.md §4）。
import type { Rng } from "../../core/prng";

/** レア度に応じたキラキラの見た目。 */
const SPARKLE_SETS = {
  normal: ["✨", "⭐", "💫", "🌟"],
  rare: ["✨", "⭐", "💫", "🌟", "💖", "🔷"],
  super: ["✨", "🌟", "💎", "👑", "🌈", "🎉"],
} as const;

export type SparkleVariant = keyof typeof SPARKLE_SETS;

/** バリアントごとの飛距離・サイズの倍率（レアほど大きく派手に）。 */
const VARIANT_SCALE: Record<SparkleVariant, number> = {
  normal: 1.0,
  rare: 1.15,
  super: 1.35,
};

/**
 * container 内にキラキラ粒子を生成して弾けさせ、アニメ終了で DOM から除去する。
 * 乱数は演出用に Rng を使う（抽選ロジックではないが、方針に合わせて PRNG を経由）。
 */
export function burstSparkles(
  container: HTMLElement,
  rng: Rng,
  count = 16,
  variant: SparkleVariant = "normal",
): void {
  const set = SPARKLE_SETS[variant];
  const scale = VARIANT_SCALE[variant];

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = `sparkle sparkle--${variant}`;
    s.textContent = set[Math.floor(rng() * set.length)]!;

    const angle = rng() * Math.PI * 2;
    const dist = (90 + rng() * 140) * scale;
    s.style.setProperty("--dx", `${(Math.cos(angle) * dist).toFixed(1)}px`);
    s.style.setProperty("--dy", `${(Math.sin(angle) * dist).toFixed(1)}px`);
    s.style.setProperty("--delay", `${(rng() * 140).toFixed(0)}ms`);
    s.style.setProperty("--size", `${((0.9 + rng() * 1.3) * scale).toFixed(2)}rem`);

    s.addEventListener("animationend", () => s.remove());
    container.appendChild(s);
  }
}

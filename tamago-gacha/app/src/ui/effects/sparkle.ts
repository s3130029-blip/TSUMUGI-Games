// 登場時のキラキラ粒子（軽量）。個数は少なめ（既定〜最大40程度）なので CSS アニメで実装する。
// ※恒常的に40超にする場合は Canvas に切り替える（CLAUDE.md §4）。
// 派手さの底上げとして、粒子に加えて「衝撃波リング」と「後光（グロー）」を各1要素ずつ重ねる
// （DOM要素は2個だけ増える軽量な手法で、粒子数を増やさずに見映えを強化する）。
import type { Rng } from "../../core/prng";

/** レア度に応じたキラキラの見た目。 */
const SPARKLE_SETS = {
  normal: ["✨", "⭐", "💫", "🌟", "❇️"],
  rare: ["✨", "⭐", "💫", "🌟", "💖", "🔷", "🎀"],
  super: ["✨", "🌟", "💎", "👑", "🌈", "🎉", "💝", "🪄"],
} as const;

export type SparkleVariant = keyof typeof SPARKLE_SETS;

/** バリアントごとの飛距離・サイズの倍率（レアほど大きく派手に）。 */
const VARIANT_SCALE: Record<SparkleVariant, number> = {
  normal: 1.0,
  rare: 1.2,
  super: 1.5,
};

/**
 * container 内にキラキラ粒子を生成して弾けさせ、アニメ終了で DOM から除去する。
 * あわせて中央から広がる衝撃波リングと後光を1つずつ重ね、派手さを底上げする。
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

  // 後光（ふわっと光る radial グラデ）＋ 衝撃波リング（シュッと広がる円）。各1要素。
  appendOneShot(container, `sparkle-glow sparkle-glow--${variant}`);
  appendOneShot(container, `sparkle-ring sparkle-ring--${variant}`);
  // 激レアはリングを二重にして、より勢いよく弾ける印象にする（要素は1つだけ追加）。
  if (variant === "super") appendOneShot(container, "sparkle-ring sparkle-ring--super sparkle-ring--delay");

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = `sparkle sparkle--${variant}`;
    s.textContent = set[Math.floor(rng() * set.length)]!;

    // 飛距離を広めに取り、回転も加えて弾ける感を強める。
    const angle = rng() * Math.PI * 2;
    const dist = (120 + rng() * 180) * scale;
    s.style.setProperty("--dx", `${(Math.cos(angle) * dist).toFixed(1)}px`);
    s.style.setProperty("--dy", `${(Math.sin(angle) * dist).toFixed(1)}px`);
    s.style.setProperty("--delay", `${(rng() * 160).toFixed(0)}ms`);
    s.style.setProperty("--size", `${((0.9 + rng() * 1.5) * scale).toFixed(2)}rem`);
    // 回転は -360〜+360度のあいだでばらつかせる（くるくる回りながら飛ぶ）。
    s.style.setProperty("--spin", `${(rng() * 720 - 360).toFixed(0)}deg`);

    s.addEventListener("animationend", () => s.remove());
    container.appendChild(s);
  }
}

/** クラスだけ持つ single-shot 要素を追加し、アニメ終了で除去する（リング・グロー用）。 */
function appendOneShot(container: HTMLElement, className: string): void {
  const el = document.createElement("span");
  el.className = className;
  el.addEventListener("animationend", () => el.remove());
  container.appendChild(el);
}

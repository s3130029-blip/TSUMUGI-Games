// メイン（ガチャ）画面。タマゴ演出シーケンス①〜⑧を制御する（REQUIREMENTS.md 4.1）。
// ロジック（抽選）は core に分離。ここは DOM 操作・SVGグループへのクラス付与で演出する。
import { TIMING, RARITY_EFFECT } from "../config";
import { drawItem } from "../core/gacha";
import { mulberry32, randomSeed, type Rng } from "../core/prng";
import { ITEMS } from "../data/items";
import type { ItemDef } from "../data/items";
import { burstSparkles } from "./effects/sparkle";
import { eggSvgMarkup } from "./svg-egg";
import { must } from "./dom";
import { playSfx } from "../audio/sfx";

/** 演出の進行状態。idle のときだけ次のガチャを受け付ける（連打対策）。 */
type Phase = "idle" | "playing" | "result";

/** ガチャ画面のオプション（フェーズ3で追加、フェーズ5で設定・ひかえめを追加）。 */
export interface GachaScreenOptions {
  /** 取得を記録して永続化する。初回判定と取得後の個数を返す。 */
  onCollect: (itemId: string) => { isNew: boolean; count: number };
  /** 図鑑へ遷移する。 */
  onOpenZukan: () => void;
  /** 設定モーダルを開く。 */
  onOpenSettings: () => void;
  /** 演出ひかえめか（OS設定 or アプリ設定）。各演出の開始時に評価する。 */
  isReducedMotion: () => boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

export function mountGachaScreen(root: HTMLElement, opts: GachaScreenOptions): void {
  // 抽選・演出で共有する乱数。通常プレイは非決定的シードから。
  const rng: Rng = mulberry32(randomSeed());
  let phase: Phase = "idle";

  root.innerHTML = `
    <main class="gacha">
      <button class="gacha__settings-btn" type="button" aria-label="せっていを開く">⚙</button>
      <button class="gacha__zukan-btn" type="button" aria-label="ずかんを開く">ずかん</button>
      <div class="gacha__stage" data-phase="idle">
        <div class="flash" aria-hidden="true"></div>
        <button class="egg-button" type="button" aria-label="タマゴをタップしてガチャを回す">
          ${eggSvgMarkup()}
        </button>
        <div class="result" aria-live="polite"></div>
        <div class="sparkles" aria-hidden="true"></div>
      </div>
      <p class="hint">タマゴをタップしてね！</p>
    </main>
  `;

  const stage = must<HTMLElement>(root, ".gacha__stage");
  const eggButton = must<HTMLButtonElement>(root, ".egg-button");
  const zukanButton = must<HTMLButtonElement>(root, ".gacha__zukan-btn");
  const settingsButton = must<HTMLButtonElement>(root, ".gacha__settings-btn");
  const eggShake = must<SVGGElement>(root, ".egg-shake");
  const eggTop = must<SVGGElement>(root, ".egg-top");
  const eggBottom = must<SVGGElement>(root, ".egg-bottom");
  const crack = must<SVGPathElement>(root, ".egg-crack");
  const flash = must<HTMLElement>(root, ".flash");
  const result = must<HTMLElement>(root, ".result");
  const sparkles = must<HTMLElement>(root, ".sparkles");
  const hint = must<HTMLElement>(root, ".hint");

  function setPhase(p: Phase): void {
    phase = p;
    stage.dataset.phase = p;
  }

  async function play(): Promise<void> {
    if (phase !== "idle") return; // 演出中・結果中のタップは無視（破綻防止）

    // 演出控えめモード（OS 設定 or アプリ設定）。開始時に評価して時間を短縮する（CLAUDE.md §7）。
    const prefersReduced = opts.isReducedMotion();
    const t = prefersReduced ? { squash: 60, shake: 280, open: 120, reveal: 220 } : TIMING;

    setPhase("playing");
    playSfx("tap"); // ① タップの手応え（音）
    result.replaceChildren();
    sparkles.replaceChildren();
    hint.textContent = "";

    // 抽選を先に確定し、レア度で溜め時間・色・粒子を変える（フェーズ2）。
    const item = drawItem(rng, ITEMS);
    const fx = RARITY_EFFECT[item.rarity];
    // data-rarity を早めに付けると、長い溜めの間に背景の色変化（虹など）でワクワクを演出できる。
    stage.dataset.rarity = item.rarity;

    // ① 予兆（スクワッシュ&ストレッチ）
    eggShake.classList.add("is-squash");
    await sleep(t.squash);
    eggShake.classList.remove("is-squash");

    // ②③ 振動＋ひび割れ（レアほど長く溜める）。ひびは transition 時間を溜めに合わせる。
    const shakeDur = Math.round(t.shake * fx.shakeScale);
    crack.style.setProperty("--crack-dur", `${shakeDur}ms`);
    eggShake.classList.add("is-shaking");
    crack.classList.add("is-cracking");
    await sleep(shakeDur);
    eggShake.classList.remove("is-shaking");

    // スローモーション気味の「ため」（superRare ほど長い／控えめモードでは省略）
    const hold = prefersReduced ? 0 : fx.holdBeforeOpen;
    if (hold > 0) await sleep(hold);

    // ④ パカッ＋フラッシュ
    const openDur = `${t.open}ms`;
    eggTop.style.setProperty("--open-dur", openDur);
    eggBottom.style.setProperty("--open-dur", openDur);
    eggTop.classList.add("is-open");
    eggBottom.classList.add("is-open");
    flash.classList.add("is-flash");
    playSfx("open"); // ④ パカッの音
    if (!prefersReduced) burstSparkles(sparkles, rng, fx.sparkleCount, fx.sparkleVariant);
    await sleep(t.open);
    flash.classList.remove("is-flash");

    // ⑤⑥ 登場（バウンド）＋キラキラ。ここで図鑑へ記録・永続化する（フェーズ3）。
    const collected = opts.onCollect(item.id);
    // ⑥ キラキラ音。レアなら専用ジングルを重ねて「やった！」を強める（REQUIREMENTS.md 4.2）。
    playSfx("sparkle");
    if (item.rarity === "rare") playSfx("rareJingle");
    else if (item.rarity === "superRare") playSfx("superJingle");
    showResult(item, fx, collected);
    await sleep(t.reveal);

    // ⑦ 結果表示完了
    setPhase("result");
    hint.textContent = "タップでつぎへ";
  }

  function showResult(
    item: ItemDef,
    fx: (typeof RARITY_EFFECT)[ItemDef["rarity"]],
    collected: { isNew: boolean; count: number },
  ): void {
    // 絵文字表示（assetUrl への差し替えは将来）。レアならバッジを添える。
    const badge = fx.label ? `<div class="result__rarity">${fx.label}</div>` : "";
    // 初回は「NEW!」、ダブりは「○こめ！」（REQUIREMENTS.md 7：集める動機付け）。
    const status = collected.isNew
      ? `<div class="result__new">NEW!</div>`
      : `<div class="result__dupe">${collected.count}こめ！</div>`;
    result.innerHTML = `
      ${badge}
      ${status}
      <div class="result__item">${item.emoji}</div>
      <div class="result__got">ゲット！</div>
      <div class="result__name">${item.nameJa}</div>
    `;
  }

  function reset(): void {
    eggTop.classList.remove("is-open");
    eggBottom.classList.remove("is-open");
    crack.classList.remove("is-cracking");
    result.replaceChildren();
    sparkles.replaceChildren();
    hint.textContent = "タマゴをタップしてね！";
    delete stage.dataset.rarity;
    setPhase("idle");
  }

  // タマゴをタップ → ガチャ開始。
  eggButton.addEventListener("click", () => {
    if (phase === "idle") void play();
  });
  // 結果表示中に画面のどこかをタップ → 次のタマゴへ。
  stage.addEventListener("click", () => {
    if (phase === "result") reset();
  });
  // 図鑑へ（stage の外に置くため、上の「つぎへ」タップとは競合しない）。
  zukanButton.addEventListener("click", () => opts.onOpenZukan());
  // 設定へ（同じく stage 外）。
  settingsButton.addEventListener("click", () => opts.onOpenSettings());
}

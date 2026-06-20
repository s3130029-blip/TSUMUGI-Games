// 効果音（Web Audio API の合成音）。REQUIREMENTS.md 2.2 / 7 / CLAUDE.md §4。
// - 音声ファイルを使わず、オシレータ＋ゲインのエンベロープで「ポン／パカッ／キラーン／ジングル」を合成する。
// - 発音は副作用なので Vitest 対象外（実機聴取で確認）。読み上げ(speech.ts)と同じく1モジュールに閉じる。
// - iOS Safari は AudioContext がユーザー操作起点でのみ動くため、初回タップで resume() する（CLAUDE.md §7）。
// - 設定OFF（soundEnabled=false）や未対応環境では何もしない。

import { SFX_MASTER_GAIN } from "../config";

/** 鳴らせる効果音の種類。 */
export type SfxName = "tap" | "open" | "sparkle" | "rareJingle" | "superJingle";

// 遅延生成する AudioContext（初回の playSfx / resume 時に作る）。未対応環境では null のまま。
let ctx: AudioContext | null = null;
// 設定（app.ts から注入）。既定は ON。未対応環境では結局無音。
let soundEnabled = true;

/** この環境で Web Audio が使えるか。 */
function isAudioSupported(): boolean {
  return typeof window !== "undefined" && typeof getAudioCtor() === "function";
}

/** AudioContext のコンストラクタ（webkit プレフィックス対応）。 */
function getAudioCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext;
}

/** AudioContext を取得（必要なら生成）。未対応なら null。 */
function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = getAudioCtor();
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

/** 効果音の ON/OFF を設定する（設定画面・起動時に app.ts から呼ぶ）。 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * 起動時に1回呼ぶ。初回のユーザー操作で一度だけ AudioContext を resume する
 * （iOS のユーザー操作起点要件を満たすため）。発音はしない。
 */
export function initAudio(): void {
  if (typeof window === "undefined" || !isAudioSupported()) return;

  const unlock = (): void => {
    const c = getCtx();
    if (c && c.state === "suspended") void c.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("click", unlock);
  };
  // いずれかの最初の操作で解錠（one-shot）。passive で演出の妨げにしない。
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("click", unlock, { passive: true });
}

/**
 * 1音（オシレータ＋ゲインのエンベロープ）を鳴らす。
 * @param freq    周波数(Hz)。配列なら開始→終了へ周波数を滑らせる（チャープ）。
 * @param startAt ctx.currentTime からの開始オフセット(秒)。
 * @param dur     長さ(秒)。
 * @param type    波形。
 * @param gain    この音のピーク音量（マスター音量に乗算）。
 */
function tone(
  c: AudioContext,
  freq: number | [number, number],
  startAt: number,
  dur: number,
  type: OscillatorType,
  gain: number,
): void {
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;

  if (Array.isArray(freq)) {
    osc.frequency.setValueAtTime(freq[0], t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq[1]), t0 + dur);
  } else {
    osc.frequency.setValueAtTime(freq, t0);
  }

  const peak = Math.max(0.0001, gain * SFX_MASTER_GAIN);
  // 立ち上がりは速く、減衰は指数で自然に（クリックノイズを避ける）。
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** 音階を順番に鳴らす（ジングル用）。各音の長さ・間隔は step 秒。 */
function arpeggio(
  c: AudioContext,
  freqs: readonly number[],
  step: number,
  dur: number,
  type: OscillatorType,
  gain: number,
): void {
  freqs.forEach((f, i) => tone(c, f, i * step, dur, type, gain));
}

/** 効果音を鳴らす。OFF・未対応・コンテキスト未生成時は無音で返る。 */
export function playSfx(name: SfxName): void {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  // 解錠前（suspended）でも resume を試みる。失敗してもプレイは継続。
  if (c.state === "suspended") void c.resume();

  switch (name) {
    case "tap":
      // ポン：軽い丸い単発音。
      tone(c, [520, 320], 0, 0.12, "triangle", 0.9);
      break;
    case "open":
      // パカッ：上に弾ける短いチャープ＋軽い余韻。
      tone(c, [300, 760], 0, 0.16, "square", 0.6);
      tone(c, [760, 900], 0.05, 0.18, "sine", 0.7);
      break;
    case "sparkle":
      // キラーン：高音の上昇アルペジオ。
      arpeggio(c, [1320, 1760, 2200], 0.06, 0.18, "sine", 0.5);
      break;
    case "rareJingle":
      // レア：明るい3音（ド・ミ・ソ）。
      arpeggio(c, [659.25, 830.61, 987.77], 0.1, 0.22, "triangle", 0.7);
      break;
    case "superJingle":
      // 激レア：華やかな上昇ファンファーレ（ド・ミ・ソ・ド・ミ）。
      arpeggio(c, [523.25, 659.25, 783.99, 1046.5, 1318.51], 0.11, 0.3, "triangle", 0.75);
      break;
  }
}

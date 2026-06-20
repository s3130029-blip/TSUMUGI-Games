// 日英読み上げ（Web Speech API / SpeechSynthesis）。REQUIREMENTS.md 4.4 / CLAUDE.md §7。
// - 音声選択ロジック（pickVoice）は純粋関数としてテスト対象にする。
// - 発話そのものは副作用（実機での目視/聴取確認）。ロジックと副作用を分離する（CLAUDE.md §5）。
// - 音声リストは非同期読み込みのため voiceschanged を待ってキャッシュする。
// - iOS Safari は発話がユーザー操作（タップ）起点である必要がある → 呼び出しはタップ駆動にする。
// - 未対応端末では何もしない。呼び出し側は表示済みの名前テキストでフォローする。

import { SPEECH_RATE } from "../config";

/** この環境で読み上げ（SpeechSynthesis）が使えるか。 */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * 言語コードに最も合う音声を選ぶ（純粋関数・テスト対象）。
 * 優先順位：完全一致 > 言語プレフィックス一致（ja / en）> 該当なし(null)。
 * voice.lang は "ja-JP" / "ja_JP" / "ja" など端末差があるため正規化して比較する。
 */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  const want = normalizeLang(lang);
  const wantPrefix = langPrefix(lang);

  const exact = voices.find((v) => normalizeLang(v.lang) === want);
  if (exact) return exact;

  const prefix = voices.find((v) => langPrefix(v.lang) === wantPrefix);
  return prefix ?? null;
}

/** "ja_JP" → "ja-jp" のように小文字＋ハイフン区切りへ正規化する。 */
function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace(/_/g, "-");
}

/** 言語コードの主部分（"ja-JP" → "ja"）。 */
function langPrefix(lang: string): string {
  return normalizeLang(lang).split("-")[0] ?? "";
}

/** voiceschanged で更新する音声キャッシュ。speak 時は同期取得できないことがあるため温めておく。 */
let cachedVoices: readonly SpeechSynthesisVoice[] = [];

/** 最新の音声リストを取り込む。 */
function refreshVoices(): void {
  if (!isSpeechSupported()) return;
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) cachedVoices = list;
}

/**
 * 起動時に1回呼ぶ。音声リストを温め、以降の更新（voiceschanged）を購読する。
 * 発話はしない（iOSのユーザー操作起点要件には触れない）。
 */
export function initSpeech(): void {
  if (!isSpeechSupported()) return;
  refreshVoices();
  // 一部ブラウザは初期に空配列を返し、後から voiceschanged で通知する。
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

/** 読み上げ1フレーズ分の指定。 */
interface SpeakPart {
  text: string;
  /** BCP-47 風の言語コード（例: "ja-JP" / "en-US"）。 */
  lang: string;
  /** 読み上げ速度（既定 1.0）。子ども向けに少しゆっくりにする。 */
  rate?: number;
}

/** 発話を中断する関数。何もしない場合も同じ型を返し、呼び出し側を単純にする。 */
export type CancelSpeak = () => void;

/**
 * 複数フレーズを登録順に読み上げる。進行中の発話があればキャンセルしてから始める。
 * SpeechSynthesis 内部キューが順番再生を担う。戻り値で中断できる。
 */
export function speakSequence(parts: readonly SpeakPart[]): CancelSpeak {
  if (!isSpeechSupported() || parts.length === 0) return noop;

  const synth = window.speechSynthesis;
  // 進行中・保留中があるときだけキャンセル（cancel直後のspeak取りこぼし＝iOSの癖を避ける）。
  if (synth.speaking || synth.pending) synth.cancel();

  for (const part of parts) {
    const u = new SpeechSynthesisUtterance(part.text);
    u.lang = part.lang;
    if (part.rate != null) u.rate = part.rate;
    const voice = pickVoice(cachedVoices, part.lang);
    // 音声が未取得（null）でも lang 指定で端末既定の音声が選ばれる。
    if (voice) u.voice = voice;
    synth.speak(u);
  }

  return () => synth.cancel();
}

/**
 * 日本語名 → 英語名 の順に読み上げる（REQUIREMENTS.md 4.4 のメイン用途）。
 * 速度は config の SPEECH_RATE を使う。戻り値で中断できる。
 */
export function speakJaThenEn(nameJa: string, nameEn: string): CancelSpeak {
  return speakSequence([
    { text: nameJa, lang: "ja-JP", rate: SPEECH_RATE.ja },
    { text: nameEn, lang: "en-US", rate: SPEECH_RATE.en },
  ]);
}

/** 進行中の発話をすべて止める。 */
export function cancelSpeak(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

const noop: CancelSpeak = () => {};

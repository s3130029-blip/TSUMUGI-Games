import { describe, it, expect } from "vitest";
import { pickVoice } from "../src/audio/speech";

// pickVoice は純粋関数なので、最小限のモック音声で挙動を検証する（CLAUDE.md §5 / §11）。
// 実際の発話（SpeechSynthesis）は副作用のため実機で確認する。

/** lang だけ持つ最小モック音声を作る（SpeechSynthesisVoice として扱う）。 */
function voice(lang: string, name = lang): SpeechSynthesisVoice {
  return {
    lang,
    name,
    default: false,
    localService: true,
    voiceURI: name,
  } as SpeechSynthesisVoice;
}

describe("pickVoice", () => {
  it("完全一致を最優先する", () => {
    const voices = [voice("ja"), voice("ja-JP"), voice("en-US")];
    expect(pickVoice(voices, "ja-JP")?.lang).toBe("ja-JP");
  });

  it("完全一致がなければ言語プレフィックス一致を選ぶ", () => {
    const voices = [voice("en-US"), voice("ja-Hira")];
    // "ja-JP" の完全一致は無いが、プレフィックス "ja" が一致する。
    expect(pickVoice(voices, "ja-JP")?.lang).toBe("ja-Hira");
  });

  it("大文字小文字・区切り(_)の違いを吸収して一致させる", () => {
    const voices = [voice("JA_jp")];
    expect(pickVoice(voices, "ja-JP")?.lang).toBe("JA_jp");
  });

  it("英語(en-US)も同様に選べる", () => {
    const voices = [voice("ja-JP"), voice("en-GB"), voice("en-US")];
    expect(pickVoice(voices, "en-US")?.lang).toBe("en-US");
  });

  it("プレフィックスは先頭一致のみ（部分文字列では一致しない）", () => {
    // "jam" の主部分は "jam" であり、"ja" とは別物として扱う。
    const voices = [voice("jam-XX")];
    expect(pickVoice(voices, "ja-JP")).toBeNull();
  });

  it("該当する音声が無ければ null を返す", () => {
    const voices = [voice("fr-FR"), voice("de-DE")];
    expect(pickVoice(voices, "ja-JP")).toBeNull();
  });

  it("空配列なら null を返す", () => {
    expect(pickVoice([], "ja-JP")).toBeNull();
  });
});

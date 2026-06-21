// アイテム詳細モーダル（REQUIREMENTS.md 6.3）。
// 拡大表示・日本語名・英語名・レア度・取得個数を出す。
// フェーズ4：開いた瞬間に「英語名→日本語名」を読み上げ、「🔊 よんで」ボタンで再生できる。
import type { ItemDef } from "../data/items";
import { RARITY_LABEL } from "./labels";
import { must } from "./dom";
import { isSpeechSupported, speakEnThenJa, cancelSpeak } from "../audio/speech";

/** 詳細モーダルのオプション。 */
export interface DetailModalOptions {
  /** 読み上げを使うか（設定OFF時は false）。未対応端末では結局ボタンを出さない。 */
  speechEnabled: boolean;
}

/**
 * 詳細モーダルを開く。背景タップまたは×で閉じる。
 * 文言は自前のマスタ由来（信頼できる値）なので innerHTML で組み立てる。
 */
export function openDetailModal(item: ItemDef, count: number, opts: DetailModalOptions): void {
  // 読み上げを出すのは「設定ON かつ 端末が対応」のときだけ。未対応時は表示済みの名前テキストがフォロー。
  const canSpeak = opts.speechEnabled && isSpeechSupported();

  const overlay = document.createElement("div");
  overlay.className = "detail-modal";
  overlay.dataset.rarity = item.rarity;
  overlay.innerHTML = `
    <div class="detail-modal__card" role="dialog" aria-label="${item.nameJa} のしょうさい">
      <button class="detail-modal__close" type="button" aria-label="とじる">×</button>
      <div class="detail-modal__emoji">${item.emoji}</div>
      <div class="detail-modal__rarity">${RARITY_LABEL[item.rarity]}</div>
      <div class="detail-modal__name-ja">${item.nameJa}</div>
      <div class="detail-modal__name-en">${item.nameEn}</div>
      <div class="detail-modal__count">もってる数：${count}こ</div>
      ${canSpeak ? `<button class="detail-modal__speak" type="button">🔊 よんで</button>` : ""}
    </div>
  `;

  // 進行中の発話を止めてからモーダルを閉じる。
  const close = (): void => {
    cancelSpeak();
    overlay.remove();
  };
  // 背景（カード外）タップで閉じる。
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  must<HTMLButtonElement>(overlay, ".detail-modal__close").addEventListener("click", close);

  if (canSpeak) {
    // 連打しても破綻しないよう、speakEnThenJa は内部で進行中をキャンセルしてから読み直す。
    must<HTMLButtonElement>(overlay, ".detail-modal__speak").addEventListener("click", () => {
      speakEnThenJa(item.nameJa, item.nameEn);
    });
  }

  document.body.appendChild(overlay);

  // 開いた瞬間に自動で読み上げ（タップ起点なので iOS でも発話可能）。
  if (canSpeak) speakEnThenJa(item.nameJa, item.nameEn);
}

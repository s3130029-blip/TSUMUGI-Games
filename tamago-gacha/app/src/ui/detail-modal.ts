// アイテム詳細モーダル（REQUIREMENTS.md 6.3）。
// 拡大表示・日本語名・英語名・レア度・取得個数を出す。
// ※読み上げ（再生）ボタンはフェーズ4で追加する。
import type { ItemDef } from "../data/items";
import { RARITY_LABEL } from "./labels";
import { must } from "./dom";

/**
 * 詳細モーダルを開く。背景タップまたは×で閉じる。
 * 文言は自前のマスタ由来（信頼できる値）なので innerHTML で組み立てる。
 */
export function openDetailModal(item: ItemDef, count: number): void {
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
    </div>
  `;

  const close = (): void => overlay.remove();
  // 背景（カード外）タップで閉じる。
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  must<HTMLButtonElement>(overlay, ".detail-modal__close").addEventListener("click", close);

  document.body.appendChild(overlay);
}

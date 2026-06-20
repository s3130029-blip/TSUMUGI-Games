// 図鑑（コレクション）画面（REQUIREMENTS.md 4.3 / 6.2）。
// 全アイテムをグリッド表示。取得済みは絵文字＋名前＋個数、未取得は「？」で隠す。
// カテゴリ別フィルタとコンプリート率を備え、アイテムタップで詳細モーダルを開く。
import { ITEMS } from "../data/items";
import type { Category } from "../data/items";
import type { SaveData } from "../core/save";
import { collectionStats, isCollected, itemCount, isUnseen } from "../core/stats";
import { CATEGORY_LABEL } from "./labels";
import { openDetailModal } from "./detail-modal";
import { must } from "./dom";

/** 図鑑画面のオプション。 */
export interface ZukanScreenOptions {
  /** 表示に使う現在のセーブデータ。 */
  save: SaveData;
  /** 「ガチャへもどる」押下時に呼ばれる。 */
  onBack: () => void;
  /** アイテムの詳細を開いたとき（確認済みにして NEW を消す）に呼ばれる。 */
  onMarkSeen: (itemId: string) => void;
}

/** カテゴリ別フィルタ（"all" は全表示）。 */
type Filter = Category | "all";

const FILTERS: readonly { key: Filter; label: string }[] = [
  { key: "all", label: "ぜんぶ" },
  { key: "animal", label: CATEGORY_LABEL.animal },
  { key: "vehicle", label: CATEGORY_LABEL.vehicle },
  { key: "food", label: CATEGORY_LABEL.food },
];

export function mountZukanScreen(root: HTMLElement, opts: ZukanScreenOptions): void {
  const { save } = opts;
  const stats = collectionStats(save, ITEMS);
  let filter: Filter = "all";

  // 全コンプ時のお祝い（REQUIREMENTS.md 4.3）。
  const celebrate = stats.isComplete
    ? `<div class="zukan__complete">🎉 ぜんぶ あつめた！おめでとう！ 🎉</div>`
    : "";

  root.innerHTML = `
    <main class="zukan">
      <header class="zukan__bar">
        <button class="zukan__back" type="button">← ガチャへ</button>
        <div class="zukan__title">ずかん</div>
        <div class="zukan__progress">
          <strong>${stats.collected}</strong> / ${stats.total} しゅるい
        </div>
      </header>
      ${celebrate}
      <nav class="zukan__filters">
        ${FILTERS.map(
          (f) =>
            `<button class="zukan__filter" type="button" data-filter="${f.key}">${f.label}</button>`,
        ).join("")}
      </nav>
      <div class="zukan__grid"></div>
    </main>
  `;

  const grid = must<HTMLElement>(root, ".zukan__grid");
  const filterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".zukan__filter"));

  function renderGrid(): void {
    grid.replaceChildren();
    const list = ITEMS.filter((i) => filter === "all" || i.category === filter);

    for (const item of list) {
      const got = isCollected(save, item.id);

      if (got) {
        const count = itemCount(save, item.id);
        const unseen = isUnseen(save, item.id);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "zukan__cell is-got";
        // レア度の枠色は「取得済み」だけに付ける（未取得はレア度も隠す方針）。
        cell.dataset.rarity = item.rarity;
        // 未確認なら「NEW」バッジ（詳細を開くと消える）。
        const newBadge = unseen
          ? `<span class="zukan__new" aria-label="あたらしい">NEW</span>`
          : "";
        cell.innerHTML = `
          ${newBadge}
          <span class="zukan__emoji">${item.emoji}</span>
          <span class="zukan__name">${item.nameJa}</span>
          ${count > 1 ? `<span class="zukan__count">×${count}</span>` : ""}
        `;
        cell.addEventListener("click", () => {
          // 詳細を開いたら確認済みにし、このセルの NEW バッジを取り除く（再描画なしで即反映）。
          opts.onMarkSeen(item.id);
          cell.querySelector(".zukan__new")?.remove();
          openDetailModal(item, count, { speechEnabled: save.settings.speechEnabled });
        });
        grid.appendChild(cell);
      } else {
        // 未取得：何が出るか分からないよう「？」だけ（名前・カテゴリ・レア度を伏せる）。
        const cell = document.createElement("div");
        cell.className = "zukan__cell is-locked";
        cell.innerHTML = `<span class="zukan__q">？</span>`;
        grid.appendChild(cell);
      }
    }
  }

  function setFilter(f: Filter): void {
    filter = f;
    for (const b of filterButtons) {
      b.classList.toggle("is-active", b.dataset.filter === f);
    }
    renderGrid();
  }

  for (const b of filterButtons) {
    b.addEventListener("click", () => setFilter((b.dataset.filter as Filter) ?? "all"));
  }
  must<HTMLButtonElement>(root, ".zukan__back").addEventListener("click", () => opts.onBack());

  setFilter("all");
}

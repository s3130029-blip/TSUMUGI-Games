// 設定モーダル（REQUIREMENTS.md 6.4 / 7・フェーズ5）。
// よみあげ／こうかおん／えんしゅつひかえめ の ON-OFF と、データリセット（保護者向け）。
// detail-modal と同様、背景タップまたは×で閉じる。設定変更は onChange で app に通知する。
import { must } from "./dom";

/** 設定（boolean）のキー。app.ts の SaveData["settings"] と一致させる。 */
export type SettingKey = "speechEnabled" | "soundEnabled" | "reducedMotion";

/** 設定モーダルのオプション。 */
export interface SettingsModalOptions {
  speechEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  /** トグル変更時に呼ばれる。 */
  onChange: (key: SettingKey, value: boolean) => void;
  /** データリセット確定時に呼ばれる（モーダルは自動で閉じる）。 */
  onReset: () => void;
}

/** 表示する設定トグルの定義（順序＝表示順）。 */
const TOGGLES: readonly { key: SettingKey; label: string; hint: string }[] = [
  { key: "speechEnabled", label: "よみあげ", hint: "ずかんで なまえを よみあげる" },
  { key: "soundEnabled", label: "こうかおん", hint: "タップや パカッの おと" },
  { key: "reducedMotion", label: "えんしゅつ ひかえめ", hint: "はげしい うごきを おさえる" },
];

/** 設定モーダルを開く。 */
export function openSettingsModal(opts: SettingsModalOptions): void {
  const current: Record<SettingKey, boolean> = {
    speechEnabled: opts.speechEnabled,
    soundEnabled: opts.soundEnabled,
    reducedMotion: opts.reducedMotion,
  };

  const overlay = document.createElement("div");
  overlay.className = "settings-modal";
  overlay.innerHTML = `
    <div class="settings-modal__card" role="dialog" aria-label="せってい">
      <button class="settings-modal__close" type="button" aria-label="とじる">×</button>
      <h2 class="settings-modal__title">せってい</h2>
      <div class="settings-modal__list">
        ${TOGGLES.map(
          (t) => `
          <label class="settings-row">
            <span class="settings-row__text">
              <span class="settings-row__label">${t.label}</span>
              <span class="settings-row__hint">${t.hint}</span>
            </span>
            <input class="settings-row__toggle" type="checkbox" data-key="${t.key}"
              ${current[t.key] ? "checked" : ""} />
            <span class="settings-row__switch" aria-hidden="true"></span>
          </label>`,
        ).join("")}
      </div>
      <button class="settings-modal__reset" type="button">データを リセット</button>
      <p class="settings-modal__note">あつめた ものが ぜんぶ きえます（おうちのひと むけ）</p>
    </div>
  `;

  const close = (): void => overlay.remove();

  // 背景（カード外）タップで閉じる。
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  must<HTMLButtonElement>(overlay, ".settings-modal__close").addEventListener("click", close);

  // 各トグルの変更を通知（チェックボックスの意味論をそのまま使う＝アクセシブル）。
  for (const input of overlay.querySelectorAll<HTMLInputElement>(".settings-row__toggle")) {
    input.addEventListener("change", () => {
      const key = input.dataset.key as SettingKey;
      opts.onChange(key, input.checked);
    });
  }

  // データリセット：保護者確認のうえ実行し、モーダルを閉じる。
  must<HTMLButtonElement>(overlay, ".settings-modal__reset").addEventListener("click", () => {
    if (window.confirm("あつめた ものを ぜんぶ けします。よろしいですか？")) {
      opts.onReset();
      close();
    }
  });

  document.body.appendChild(overlay);
}

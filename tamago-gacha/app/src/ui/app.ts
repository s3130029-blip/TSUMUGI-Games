// 画面遷移の統括＋セーブの簡易ストア（フェーズ3〜5）。
// セーブは起動時に1回ロードして保持し、ガチャでの取得・設定変更・リセットを localStorage に反映する。
import {
  loadSave,
  recordCollect,
  markSeen,
  saveSave,
  defaultSave,
  type SaveData,
} from "../core/save";
import { setSoundEnabled } from "../audio/sfx";
import { mountGachaScreen } from "./gacha-screen";
import { mountZukanScreen } from "./zukan-screen";
import { openSettingsModal } from "./settings-modal";

/** 設定（boolean）のキー。 */
type SettingKey = keyof SaveData["settings"];

export function startApp(root: HTMLElement): void {
  // 現在のセーブ（破損・未保存時は既定値にフォールバックされる）。
  let save: SaveData = loadSave();
  // 直近に表示した画面（データリセット後の再描画に使う）。
  let showCurrent: () => void = showGacha;

  // 起動時に設定の副作用（効果音 ON/OFF・演出ひかえめ）を反映する。
  applySettings();

  /** ガチャ結果を記録して永続化し、初回判定と取得後の個数を返す。 */
  function collect(itemId: string): { isNew: boolean; count: number } {
    const result = recordCollect(save, itemId, Date.now());
    save = result.save;
    saveSave(save);
    return { isNew: result.isNew, count: save.collected[itemId]!.count };
  }

  /** 図鑑で詳細を開いたアイテムを「確認済み」にして永続化する（NEWバッジを消す）。 */
  function seen(itemId: string): void {
    const next = markSeen(save, itemId);
    if (next === save) return; // 変化なし（未取得・既に確認済み）なら保存もしない
    save = next;
    saveSave(save);
  }

  /** OS設定 or アプリ設定のいずれかで演出ひかえめか。 */
  function isReducedMotion(): boolean {
    const os = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return os || save.settings.reducedMotion;
  }

  /** 設定の副作用を反映する（効果音の有効/無効・演出ひかえめクラス）。 */
  function applySettings(): void {
    setSoundEnabled(save.settings.soundEnabled);
    document.documentElement.classList.toggle("is-reduced", isReducedMotion());
  }

  /** 設定変更を保存し、副作用を即時反映する。 */
  function setSetting(key: SettingKey, value: boolean): void {
    save = { ...save, settings: { ...save.settings, [key]: value } };
    saveSave(save);
    applySettings();
  }

  /** データをリセット（初期状態へ）し、副作用反映＋現在画面を再描画する。 */
  function resetData(): void {
    save = defaultSave();
    saveSave(save);
    applySettings();
    showCurrent();
  }

  /** 設定モーダルを開く。 */
  function openSettings(): void {
    openSettingsModal({
      speechEnabled: save.settings.speechEnabled,
      soundEnabled: save.settings.soundEnabled,
      reducedMotion: save.settings.reducedMotion,
      onChange: setSetting,
      onReset: resetData,
    });
  }

  function showGacha(): void {
    showCurrent = showGacha;
    mountGachaScreen(root, {
      onCollect: collect,
      onOpenZukan: showZukan,
      onOpenSettings: openSettings,
      isReducedMotion,
      isSpeechEnabled: () => save.settings.speechEnabled,
    });
  }

  function showZukan(): void {
    showCurrent = showZukan;
    mountZukanScreen(root, {
      save,
      onBack: showGacha,
      onMarkSeen: seen,
    });
  }

  showGacha();
}

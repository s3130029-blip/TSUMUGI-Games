// 画面遷移の統括＋セーブの簡易ストア（フェーズ3）。
// セーブは起動時に1回ロードして保持し、ガチャでの取得を localStorage に反映する。
import { loadSave, recordCollect, markSeen, saveSave, type SaveData } from "../core/save";
import { setSoundEnabled } from "../audio/sfx";
import { mountGachaScreen } from "./gacha-screen";
import { mountZukanScreen } from "./zukan-screen";

export function startApp(root: HTMLElement): void {
  // 現在のセーブ（破損・未保存時は既定値にフォールバックされる）。
  let save: SaveData = loadSave();
  // 起動時に効果音 ON/OFF 設定を反映する（フェーズ5）。
  setSoundEnabled(save.settings.soundEnabled);

  /** ガチャ結果を記録して永続化し、初回判定と取得後の個数を返す。 */
  function collect(itemId: string): { isNew: boolean; count: number } {
    const result = recordCollect(save, itemId, Date.now());
    save = result.save;
    saveSave(save);
    return { isNew: result.isNew, count: save.collected[itemId]!.count };
  }

  function showGacha(): void {
    mountGachaScreen(root, {
      onCollect: collect,
      onOpenZukan: showZukan,
    });
  }

  /** 図鑑で詳細を開いたアイテムを「確認済み」にして永続化する（NEWバッジを消す）。 */
  function seen(itemId: string): void {
    const next = markSeen(save, itemId);
    if (next === save) return; // 変化なし（未取得・既に確認済み）なら保存もしない
    save = next;
    saveSave(save);
  }

  function showZukan(): void {
    mountZukanScreen(root, {
      save,
      onBack: showGacha,
      onMarkSeen: seen,
    });
  }

  showGacha();
}

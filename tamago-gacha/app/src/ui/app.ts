// 画面遷移の統括＋セーブの簡易ストア（フェーズ3）。
// セーブは起動時に1回ロードして保持し、ガチャでの取得を localStorage に反映する。
import { loadSave, recordCollect, saveSave, type SaveData } from "../core/save";
import { mountGachaScreen } from "./gacha-screen";
import { mountZukanScreen } from "./zukan-screen";

export function startApp(root: HTMLElement): void {
  // 現在のセーブ（破損・未保存時は既定値にフォールバックされる）。
  let save: SaveData = loadSave();

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

  function showZukan(): void {
    mountZukanScreen(root, {
      save,
      onBack: showGacha,
    });
  }

  showGacha();
}

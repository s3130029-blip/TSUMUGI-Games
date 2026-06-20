// 画面遷移の統括。フェーズ1はガチャ画面のみ。
// フェーズ3で図鑑画面への切り替えをここに追加する。
import { mountGachaScreen } from "./gacha-screen";

export function startApp(root: HTMLElement): void {
  mountGachaScreen(root);
}

// エントリポイント。スタイルを読み込み、アプリを起動する。
import "./styles/base.css";
import "./styles/gacha.css";
import "./styles/egg.css";
import "./styles/zukan.css";
import { startApp } from "./ui/app";
import { initSpeech } from "./audio/speech";

// 読み上げの音声リストを起動時に温める（フェーズ4）。発話自体はタップ起点で行う。
initSpeech();

const root = document.getElementById("app");
if (!root) throw new Error("#app が見つかりません");
startApp(root);

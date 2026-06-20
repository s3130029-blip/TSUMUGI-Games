// エントリポイント。スタイルを読み込み、アプリを起動する。
import "./styles/base.css";
import "./styles/gacha.css";
import "./styles/egg.css";
import "./styles/zukan.css";
import { startApp } from "./ui/app";
import { initSpeech } from "./audio/speech";
import { initAudio } from "./audio/sfx";

// 読み上げの音声リストを起動時に温める（フェーズ4）。発話自体はタップ起点で行う。
initSpeech();
// 効果音の AudioContext を初回タップで解錠する（フェーズ5・iOS制約）。発音はタップ起点。
initAudio();

const root = document.getElementById("app");
if (!root) throw new Error("#app が見つかりません");
startApp(root);

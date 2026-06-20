// エントリポイント。スタイルを読み込み、アプリを起動する。
import "./styles/base.css";
import "./styles/gacha.css";
import "./styles/egg.css";
import "./styles/zukan.css";
import { startApp } from "./ui/app";

const root = document.getElementById("app");
if (!root) throw new Error("#app が見つかりません");
startApp(root);

// 本体。状態を持ち、各モジュール（生成・描画・入力・演出）を組み立てる。
var Game = (function () {
  // --- 難易度カーブ（ここだけ変えれば調整できる） ---
  // クリア数が増えるほど「段数(min〜max)」と「使う味の数(variety)」が段階的に上がる。
  // until: このクリア数になるまで（未満の間）この段階を使う。最後の段階が以降ずっと続く。
  // 子供向けに最初はやさしく（3段・3色）、ゆっくり上げて 最大8段・8色 まで。
  // ※もっと難しくするなら数値を上げる／段階を足す（最大10段・10色まで可能）。
  var DIFFICULTY = [
    { until: 2,        min: 3, max: 3, variety: 3 }, // はじめ：3段・3色
    { until: 4,        min: 3, max: 4, variety: 4 },
    { until: 6,        min: 4, max: 5, variety: 5 },
    { until: 9,        min: 4, max: 6, variety: 6 },
    { until: 12,       min: 5, max: 7, variety: 7 },
    { until: Infinity, min: 6, max: 8, variety: 8 }  // 慣れたら：6〜8段・8色
  ];
  var FREE_CAP = 10; // 自由モードの段数上限（要件の最大10段まで好きに積める）

  // 今のクリア数に応じた難易度（段階）を返す
  function difficultyFor(cleared) {
    for (var i = 0; i < DIFFICULTY.length; i++) {
      if (cleared < DIFFICULTY[i].until) return DIFFICULTY[i];
    }
    return DIFFICULTY[DIFFICULTY.length - 1];
  }
  // ---------------------------------------------------

  var state = {
    mode: null,    // 'order' | 'free'（モード間で状態を混ぜないための切り替え）
    order: [],     // 注文（下→上のid配列）
    stack: [],     // 今積んでいるアイス
    cleared: 0,    // クリア数
    combo: 0,      // 連続自力クリア数（こたえを見るとリセット）
    prevSig: '',   // 直前の注文（連続で同じにしないため）
    mistakes: 0,   // 今の注文で「全部積んだのに不一致」になった回数（評価用）
    usedSolve: false // 今の注文で「こたえを みる」を使ったか（評価用）
  };
  var solving = false; // こたえ表示の連打防止

  // クリア時の評価ごとの文言。子供向けにどれも前向きな言葉にする。
  var RATING_MSG = {
    perfect: { title: 'ぴったり！ 🎯', sub: 'かんぺき！ おいしそう！' },
    good:    { title: 'せいかい！ 🎉', sub: 'よく できました！' },
    help:    { title: 'できた！ 🍦',  sub: 'つぎは じぶんで やってみよう！' }
  };

  // 次の注文を作る。クリア数に応じて段数と味の数を段階的に増やす。
  function nextOrder() {
    var d = difficultyFor(state.cleared);
    state.order = Order.generate(d.min, d.max, d.variety, state.prevSig);
    state.prevSig = state.order.join(',');
    state.stack = [];
    state.mistakes = 0;       // 注文ごとに評価用カウンタをリセット
    state.usedSolve = false;

    Render.setOrder(state.order);
    Render.renderOrder(state.order);
    Render.renderStack(state.stack);
    Render.setHint(state.order.length);
    Render.resetCustomer();   // 客の顔をふつうに戻す
  }

  // アイスを1つ積む（ドロップした位置から設置位置まで落ちてくる）
  function place(flavorId, dropPoint) {
    // 注文モードは見本の段数まで、自由モードは上限まで積める
    var cap = (state.mode === 'free') ? FREE_CAP : state.order.length;
    if (state.stack.length >= cap) return;
    state.stack.push(flavorId);
    Sound.pop();
    Render.renderStack(state.stack, state.stack.length - 1, dropPoint);
    if (state.mode === 'order') {
      Render.setHint(state.order.length - state.stack.length);
      check();
    }
  }

  // こたえを見る：正解を1段ずつ落として完成させる
  function solve() {
    if (solving) return;
    state.usedSolve = true; // こたえを見たら評価は「help」・コンボはリセット
    solving = true;
    state.stack = [];
    Render.renderStack(state.stack);
    var i = 0;
    (function step() {
      if (state.mode !== 'order') { solving = false; return; } // 途中でモードを抜けたら中断
      state.stack.push(state.order[i]);
      Sound.pop();
      Render.renderStack(state.stack, i);
      Render.setHint(state.order.length - state.stack.length);
      i++;
      if (i < state.order.length) {
        setTimeout(step, 360); // 落下アニメに合わせる
      } else {
        solving = false;
        check(); // 最後の段で完成 → クリア演出
      }
    })();
  }

  // index 番目から上を外す
  function removeFrom(index) {
    state.stack = state.stack.slice(0, index);
    Sound.remove();
    Render.renderStack(state.stack);
    if (state.mode === 'order') Render.setHint(state.order.length - state.stack.length);
  }

  // 完成チェック（味と順番が全部一致したらクリア）
  function check() {
    if (state.stack.length !== state.order.length) return;
    for (var i = 0; i < state.order.length; i++) {
      if (state.stack[i] !== state.order[i]) {
        state.mistakes++;     // 全部積んだのに不一致 → 評価に反映（ミス1回）
        Sound.wrong();
        Render.shake();
        return;
      }
    }
    win();
  }

  // クリアの出来ばえを評価する。
  //  help    … こたえを見た（自力でない）→ コンボはリセット
  //  perfect … 自力＆ノーミス → ⭐⭐⭐
  //  good    … 自力だけどミスあり → ⭐⭐
  function evaluate() {
    if (state.usedSolve) return 'help';
    if (state.mistakes === 0) return 'perfect';
    return 'good';
  }

  function win() {
    var rating = evaluate();
    if (rating === 'help') {
      state.combo = 0;        // こたえを見たらコンボは途切れる
    } else {
      state.combo++;          // 自力クリアでコンボ加算（ミスがあっても続く＝子供にやさしく）
    }
    state.cleared++;
    Render.updateScore(state.cleared);
    Render.updateCombo(state.combo);
    Render.customerReact(rating); // 客が喜ぶリアクション
    Sound.win(rating === 'perfect' ? 3 : (rating === 'good' ? 2 : 1));
    if (rating !== 'help' && state.combo >= 2) Sound.combo(state.combo);

    var stars = (rating === 'perfect') ? 3 : (rating === 'good' ? 2 : 1);
    var msg = RATING_MSG[rating];
    Effects.celebrate(function () { nextOrder(); }, {
      title: msg.title,
      sub:   msg.sub,
      stars: stars,
      combo: (rating !== 'help') ? state.combo : 0 // helpのときはコンボ表示なし
    });
  }

  // 自由モード：好きに積めたら「できた！」でお祝い。閉じても作品はそのまま残して眺められる。
  function finishFree() {
    if (state.stack.length === 0) return; // 何も積んでいなければ何もしない
    Sound.win(3);
    Effects.celebrate(null, { title: 'すてき！ 🍦', sub: 'よく できました！', btn: 'とじる' });
  }

  function reset() {
    state.stack = [];
    Render.renderStack(state.stack);
    if (state.mode === 'order') Render.setHint(state.order.length);
  }

  // --- モード切り替え（状態を混ぜないよう、入口でリセットしてから始める） ---
  function showPicker() {
    state.mode = null;
    solving = false; // こたえ表示の途中なら止める
    document.body.className = 'picking';
  }
  function startOrderMode() {
    state.mode = 'order';
    state.combo = 0;          // 入り直したらコンボは0から
    Render.updateCombo(0);
    document.body.className = 'mode-order';
    nextOrder();
  }
  function startFreeMode() {
    state.mode = 'free';
    document.body.className = 'mode-free';
    state.order = [];
    state.stack = [];
    Render.setOrder([]);     // 'wrong' の色分けを無効化
    Render.renderOrder([]);  // 見本をクリア（自由モードでは非表示）
    Render.renderStack(state.stack);
  }

  // tap=true のUIボタンは押すと軽いタップ音を鳴らす
  function bindClick(id, fn, tap) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      if (tap) Sound.tap();
      fn(e);
    });
  }

  // 音の ON/OFF ボタン。アイコンと見た目も切り替える。
  function toggleSound() {
    var on = Sound.toggle();
    var btn = document.getElementById('soundBtn');
    if (btn) {
      btn.textContent = on ? '🔊' : '🔇';
      btn.classList.toggle('muted', !on);
    }
  }

  return {
    start: function () {
      Render.init();
      Sound.init();
      var soundBtn = document.getElementById('soundBtn');
      if (soundBtn) { // 保存された状態をアイコンに反映
        soundBtn.textContent = Sound.isEnabled() ? '🔊' : '🔇';
        soundBtn.classList.toggle('muted', !Sound.isEnabled());
        soundBtn.addEventListener('click', toggleSound);
      }
      Input.init(Render.dropZone(), place, removeFrom);
      bindClick('resetBtn', reset, true);
      bindClick('solveBtn', solve, true);
      bindClick('doneBtn', finishFree, true);
      bindClick('homeBtn', showPicker, true);
      bindClick('modeOrder', startOrderMode, true);
      bindClick('modeFree', startFreeMode, true);
      showPicker(); // 最初はモード選択から
    }
  };
})();

window.addEventListener('DOMContentLoaded', function () { Game.start(); });

// 描画（DOMの組み立て）担当。状態は持たず、渡されたデータを画面に反映するだけ。
var Render = (function () {
  var els = {};
  var currentOrder = []; // 正解判定の色分け用に注文を覚えておく
  var DEFAULT_FACE = '🧒'; // 客のふつうの顔（init で実値に置き換え）

  // 評価ごとの客の顔と、ふわっと浮かぶ絵文字
  var REACT = {
    perfect: { face: '😍', emojis: ['💖', '⭐', '✨', '💕', '💖'] },
    good:    { face: '😋', emojis: ['💕', '✨', '⭐', '💕'] },
    help:    { face: '🙂', emojis: ['✨', '🙂'] }
  };

  // 1つのアイス（スクープ）のDOMを作る
  function scoop(flavor, extraClass) {
    var d = document.createElement('div');
    d.className = 'scoop' + (extraClass ? ' ' + extraClass : '');
    d.style.backgroundColor = flavor.color;
    d.dataset.flavor = flavor.id;
    return d;
  }

  return {
    init: function () {
      els.stage       = document.getElementById('stage');
      els.builder     = document.getElementById('builder');
      els.stack       = document.getElementById('stack');
      els.sampleStack = document.querySelector('#orderSample .sample-stack');
      els.palette     = document.getElementById('palette');
      els.score       = document.getElementById('score');
      els.hint        = document.getElementById('hint');
      els.combo       = document.getElementById('combo');
      els.customer    = document.querySelector('.customer');
      els.customerFace = document.querySelector('.customer-face');
      if (els.customerFace) DEFAULT_FACE = els.customerFace.textContent.trim() || DEFAULT_FACE;
      this.buildPalette();
    },

    // 味のパレット（ドラッグ元）を作る
    buildPalette: function () {
      els.palette.innerHTML = '';
      FLAVORS.forEach(function (f) {
        var item = document.createElement('button');
        item.className = 'palette-item';
        item.type = 'button';
        item.dataset.flavor = f.id;

        var label = document.createElement('span');
        label.className = 'palette-label';
        label.textContent = f.name;

        item.appendChild(scoop(f, 'palette-scoop'));
        item.appendChild(label);
        els.palette.appendChild(item);
      });
    },

    setOrder: function (order) { currentOrder = order.slice(); },

    // 見本（お客さんの注文）を描く
    renderOrder: function (order) {
      els.sampleStack.innerHTML = '';
      order.forEach(function (id) {
        els.sampleStack.appendChild(scoop(getFlavor(id), 'small'));
      });
    },

    // 今コーンに積んでいるアイスを描く。見本と違う位置は 'wrong' で色分け。
    // animateIndex を渡すと、その段だけ落ちるアニメを付ける。
    // dropPoint（画面座標）を渡すと、その位置から設置位置まで落とす（手で置いたとき）。
    renderStack: function (stack, animateIndex, dropPoint) {
      els.stack.innerHTML = '';
      stack.forEach(function (id, i) {
        var cls = (currentOrder[i] && id !== currentOrder[i]) ? 'wrong' : '';
        var animate = (i === animateIndex);
        // dropPoint があるときは設置後に開始位置を測ってクラスを付ける（下のブロック）
        if (animate && !dropPoint) cls += (cls ? ' ' : '') + 'dropping';
        var s = scoop(getFlavor(id), cls);
        s.dataset.index = i;
        els.stack.appendChild(s);

        // 手で置いたアイスは、ドロップした位置から設置位置まで落とす。
        // 設置後の実位置を測り、ドロップ位置との差分をアニメ開始オフセットにする。
        if (animate && dropPoint) {
          var r = s.getBoundingClientRect();
          var dx = dropPoint.x - (r.left + r.width / 2);
          var dy = dropPoint.y - (r.top + r.height / 2);
          dy = Math.min(dy, 0); // 必ず「落とす」（下から浮き上がる動きは避ける）
          s.style.setProperty('--drop-dx', dx + 'px');
          s.style.setProperty('--drop-dy', dy + 'px');
          s.classList.add('drop-from');
        }
      });
    },

    // 残り段数のヒント
    setHint: function (remaining) {
      if (!els.hint) return;
      els.hint.textContent = remaining > 0 ? ('あと ' + remaining + ' こ') : 'できあがり！';
    },

    updateScore: function (n) { if (els.score) els.score.textContent = n; },

    // コンボ表示（2連続以上で「🔥 コンボ ×N」、それ未満は消す）
    updateCombo: function (n) {
      if (!els.combo) return;
      if (n >= 2) {
        els.combo.textContent = '🔥 コンボ ×' + n;
        els.combo.classList.remove('pulse');
        void els.combo.offsetWidth; // 毎回ぴょこっと弾ませる
        els.combo.classList.add('pulse');
      } else {
        els.combo.textContent = '';
        els.combo.classList.remove('pulse');
      }
    },

    // クリア時、客が喜ぶリアクション（顔が変わって弾み、ハート／星が浮かぶ）
    customerReact: function (rating) {
      var r = REACT[rating] || REACT.good;
      if (els.customerFace) {
        els.customerFace.textContent = r.face;
        els.customerFace.classList.remove('react');
        void els.customerFace.offsetWidth;
        els.customerFace.classList.add('react');
      }
      if (!els.customer) return;
      r.emojis.forEach(function (ch, i) {
        var e = document.createElement('span');
        e.className = 'react-emoji';
        e.textContent = ch;
        e.style.setProperty('--rx', (Math.random() * 40 - 20) + 'px');
        e.style.animationDelay = (i * 0.08) + 's';
        els.customer.appendChild(e);
        setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 1300 + i * 90);
      });
    },

    // 客の顔をふつうに戻す（次の注文へ）
    resetCustomer: function () {
      if (!els.customerFace) return;
      els.customerFace.textContent = DEFAULT_FACE;
      els.customerFace.classList.remove('react');
    },

    // ドロップ判定に使う領域
    dropZone: function () { return els.builder; },
    stackEl:  function () { return els.stack; },

    // 不一致のとき軽く揺らして気づかせる
    shake: function () {
      els.builder.classList.remove('shake');
      void els.builder.offsetWidth; // アニメ再生をやり直すためのリフロー
      els.builder.classList.add('shake');
    }
  };
})();

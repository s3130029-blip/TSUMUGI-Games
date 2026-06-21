// クリア演出担当。紙吹雪とお祝いメッセージを出す。
var Effects = (function () {
  var COLORS = ['#ff5d6c', '#ffd83d', '#5ec8f0', '#8ec641', '#a06cd5', '#ff9f43', '#ff7fa6'];

  return {
    // done: ボタンを押したときに呼ぶコールバック（無くてもよい）
    // opts: { title, sub, btn, stars, combo } で文言・評価を差し替え可能。
    //   stars … 1〜3。⭐の数で出来ばえを表す（注文モードの評価）
    //   combo … 2以上のとき「🔥 コンボ ×N」を表示
    celebrate: function (done, opts) {
      opts = opts || {};
      var fx = document.getElementById('fx');
      fx.innerHTML = '';
      fx.classList.add('show');

      // 紙吹雪
      for (var i = 0; i < 90; i++) {
        var p = document.createElement('div');
        p.className = 'confetti';
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.backgroundColor = COLORS[i % COLORS.length];
        p.style.animationDelay = (Math.random() * 0.6) + 's';
        p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
        fx.appendChild(p);
      }

      // お祝いカード
      var card = document.createElement('div');
      card.className = 'win-card';

      var title = document.createElement('div');
      title.className = 'win-title';
      title.textContent = opts.title || 'できた！ 🎉';
      card.appendChild(title);

      // 出来ばえの星（⭐の数）。評価が渡されたときだけ出す。
      if (opts.stars) {
        var stars = document.createElement('div');
        stars.className = 'win-stars';
        var n = Math.max(1, Math.min(3, opts.stars));
        stars.textContent = '⭐⭐⭐'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);
        card.appendChild(stars);
      }

      var sub = document.createElement('div');
      sub.className = 'win-sub';
      sub.textContent = opts.sub || 'ありがとう！ 😋';
      card.appendChild(sub);

      // コンボ（2連続以上）。連続で正解できたときだけ目立たせる。
      if (opts.combo >= 2) {
        var combo = document.createElement('div');
        combo.className = 'win-combo';
        combo.textContent = '🔥 コンボ ×' + opts.combo + '！';
        card.appendChild(combo);
      }

      var btn = document.createElement('button');
      btn.className = 'btn big';
      btn.type = 'button';
      btn.textContent = opts.btn || 'つぎ →';
      btn.addEventListener('click', function () {
        fx.classList.remove('show');
        fx.innerHTML = '';
        if (done) done();
      });

      card.appendChild(btn);
      fx.appendChild(card);
    }
  };
})();

// 注文（見本）のランダム生成。
// 描画や入力からは独立させ、「どんな注文を作るか」だけを担当する。
var Order = {
  // FLAVORS から variety 個だけランダムに選ぶ（少ないほどやさしい）。
  // フィッシャー–イェーツでシャッフルして先頭から取る。
  pickFlavors: function (variety) {
    var pool = FLAVORS.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    var n = Math.max(1, Math.min(variety || pool.length, pool.length));
    return pool.slice(0, n);
  },

  // minLen〜maxLen のrandom な長さで、variety 種類の味だけを使ってアイス構成（id配列）を作る。
  // 配列は下から上の順（[0]が一番下のアイス）。
  // prevSig（前回の構成文字列）と同じにならないよう、数回まで作り直す。
  generate: function (minLen, maxLen, variety, prevSig) {
    var order, sig, tries = 0;
    do {
      var palette = this.pickFlavors(variety); // この注文で使える味（色数を絞る＝難易度）
      var len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
      order = [];
      for (var i = 0; i < len; i++) {
        order.push(palette[Math.floor(Math.random() * palette.length)].id);
      }
      sig = order.join(',');
      tries++;
    } while (sig === prevSig && tries < 8);
    return order;
  }
};

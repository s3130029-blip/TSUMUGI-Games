// 注文（見本）のランダム生成。
// 描画や入力からは独立させ、「どんな注文を作るか」だけを担当する。
var Order = {
  // minLen〜maxLen のランダムな長さで、ランダムなアイス構成（id配列）を作る。
  // 配列は下から上の順（[0]が一番下のアイス）。
  // prevSig（前回の構成文字列）と同じにならないよう、数回まで作り直す。
  generate: function (minLen, maxLen, prevSig) {
    var order, sig, tries = 0;
    do {
      var len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
      order = [];
      for (var i = 0; i < len; i++) {
        var f = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
        order.push(f.id);
      }
      sig = order.join(',');
      tries++;
    } while (sig === prevSig && tries < 8);
    return order;
  }
};

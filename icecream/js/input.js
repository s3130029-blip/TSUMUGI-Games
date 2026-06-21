// 入力処理（タッチ／ポインタ）担当。
// iOS Safari で不安定な HTML5 Drag&Drop API は使わず、Pointer Events で自前実装する。
var Input = (function () {
  var ghost = null;          // ドラッグ中に指を追うアイスの影
  var dropEl = null;         // ドロップ判定領域（コーン周り）
  var onPlace = null;        // 置いたとき
  var onRemove = null;       // 外すとき
  var GHOST_HALF = 42;       // ゴーストの半径ぶん（中心を指に合わせる）

  function makeGhost(flavor, x, y) {
    ghost = document.createElement('div');
    ghost.className = 'scoop ghost';
    ghost.style.backgroundColor = flavor.color;
    document.body.appendChild(ghost);
    moveGhost(x, y);
  }
  function moveGhost(x, y) {
    if (ghost) ghost.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function killGhost() {
    if (ghost) { ghost.remove(); ghost = null; }
  }

  // 子供向けに判定を広めにする。とくに「上に積む」動きに合わせて上方向を広く取る。
  var PAD = { top: 600, side: 90, bottom: 40 };
  function inDropZone(x, y) {
    var r = dropEl.getBoundingClientRect();
    return x >= r.left - PAD.side && x <= r.right + PAD.side &&
           y >= r.top  - PAD.top  && y <= r.bottom + PAD.bottom;
  }

  // パレットのアイテムをドラッグできるようにする
  function bindPalette() {
    var items = document.querySelectorAll('.palette-item');
    items.forEach(function (item) {
      item.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var flavor = getFlavor(item.dataset.flavor);
        if (!flavor) return;

        try { item.setPointerCapture(e.pointerId); } catch (_) {}
        makeGhost(flavor, e.clientX - GHOST_HALF, e.clientY - GHOST_HALF);

        function move(ev) { moveGhost(ev.clientX - GHOST_HALF, ev.clientY - GHOST_HALF); }
        function end(ev) {
          item.removeEventListener('pointermove', move);
          item.removeEventListener('pointerup', end);
          item.removeEventListener('pointercancel', cancel);
          var dropped = inDropZone(ev.clientX, ev.clientY);
          killGhost();
          // ドロップした位置を渡し、その位置から設置位置まで落とす
          if (dropped && onPlace) onPlace(flavor.id, { x: ev.clientX, y: ev.clientY });
        }
        function cancel() {
          item.removeEventListener('pointermove', move);
          item.removeEventListener('pointerup', end);
          item.removeEventListener('pointercancel', cancel);
          killGhost();
        }

        item.addEventListener('pointermove', move);
        item.addEventListener('pointerup', end);
        item.addEventListener('pointercancel', cancel);
      });
    });
  }

  // 積んだアイスをタップすると、そのアイスから上を外す（やり直しやすく）
  function bindStack(stackEl) {
    stackEl.addEventListener('pointerdown', function (e) {
      var t = e.target;
      if (t && t.classList.contains('scoop')) {
        e.preventDefault();
        var idx = parseInt(t.dataset.index, 10);
        if (!isNaN(idx) && onRemove) onRemove(idx);
      }
    });
  }

  return {
    init: function (dropZone, placeCb, removeCb) {
      dropEl = dropZone;
      onPlace = placeCb;
      onRemove = removeCb;
      bindPalette();
      bindStack(Render.stackEl());
      // 長押しメニュー抑制（CSSと二重の保険）
      document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
  };
})();

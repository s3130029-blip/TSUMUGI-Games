// 入力処理（タッチ／ポインタ）担当。
// iOS Safari で不安定な HTML5 Drag&Drop API は使わず、Pointer Events で自前実装する。
var Input = (function () {
  var ghost = null;          // ドラッグ中に指を追うアイスの影
  var dropEl = null;         // ドロップ判定領域（コーン周り）
  var onPlace = null;        // 置いたとき
  var onRemove = null;       // 外すとき
  var GHOST_HALF = 42;       // ゴーストの半径ぶん（中心を指に合わせる）
  var activeCleanup = null;  // 進行中ドラッグの後始末関数（中断時に強制実行して取り残しを防ぐ）

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
  // 取りこぼした影も含めて、画面上のゴーストを全部消す（多指タッチ等の保険）
  function removeAllGhosts() {
    var gs = document.querySelectorAll('.scoop.ghost');
    for (var i = 0; i < gs.length; i++) {
      if (gs[i].parentNode) gs[i].parentNode.removeChild(gs[i]);
    }
    ghost = null;
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

        // 直前のドラッグが残っていたら強制終了（多指タッチや中断でゴーストが残るのを防ぐ）
        if (activeCleanup) activeCleanup();

        var pid = e.pointerId;
        try { item.setPointerCapture(pid); } catch (_) {}
        removeAllGhosts(); // 念のため残骸を掃除してから始める
        makeGhost(flavor, e.clientX - GHOST_HALF, e.clientY - GHOST_HALF);

        function move(ev) {
          if (ev.pointerId !== pid) return; // 別の指は無視
          moveGhost(ev.clientX - GHOST_HALF, ev.clientY - GHOST_HALF);
        }
        function onUp(ev) {
          if (ev.pointerId !== pid) return;
          var x = ev.clientX, y = ev.clientY; // 片付け前に位置を控える
          cleanup();
          // ドロップした位置を渡し、その位置から設置位置まで落とす
          if (inDropZone(x, y) && onPlace) onPlace(flavor.id, { x: x, y: y });
        }
        function onCancel(ev) {
          if (ev.pointerId !== pid) return;
          cleanup(); // 置かずに片付けるだけ（ジェスチャ横取り・パームリジェクト等）
        }
        function onInterrupt() { cleanup(); }                 // アプリが裏に回った等
        function onVis() { if (document.hidden) cleanup(); }

        function cleanup() {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          window.removeEventListener('blur', onInterrupt);
          document.removeEventListener('visibilitychange', onVis);
          try { item.releasePointerCapture(pid); } catch (_) {}
          killGhost();
          removeAllGhosts(); // 取りこぼした残骸も最終確認で掃除
          activeCleanup = null;
        }

        // window で受けると、指が要素外へ出ても・キャプチャが外れても確実に拾える
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
        window.addEventListener('blur', onInterrupt);
        document.addEventListener('visibilitychange', onVis);
        activeCleanup = cleanup;
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

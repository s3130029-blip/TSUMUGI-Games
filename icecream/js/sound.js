// 音担当。外部音源ファイルもライブラリも使わず、Web Audio API でその場で音を作る。
// （静的・単体で動く方針。素材ファイル不要で軽く、相対パスの心配もない）
// iOS Safari は「最初のユーザー操作までは鳴らない」ので、初回タッチで解錠する。
var Sound = (function () {
  var ctx = null;        // AudioContext（初回タッチで作る）
  var master = null;     // 全体の音量
  var enabled = true;    // 音の ON/OFF（既定 ON）
  var bgmTimer = null;   // BGM ループ用タイマー
  var bgmStep = 0;
  var STORE_KEY = 'icecream.sound';

  // やさしい BGM（0 は休み）。ゆっくりした音の箱っぽい繰り返し。
  var BGM = [523, 0, 659, 0, 784, 0, 659, 0, 587, 0, 659, 0, 523, 0, 0, 0];
  var BGM_INTERVAL = 430; // ms

  function load() {
    try { if (localStorage.getItem(STORE_KEY) === 'off') enabled = false; } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) {}
  }

  // AudioContext を用意（ユーザー操作の中で呼ぶこと）
  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null; // 対応していない端末では無音で続行
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    return ctx;
  }

  // 1音を鳴らす（フェードイン／アウトのエンベロープ付きで耳ざわりにしない）
  function tone(freq, when, dur, type, peak) {
    if (!ctx || !freq) return;
    var t = ctx.currentTime + (when || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak || 0.18, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  // 効果音をまとめて鳴らす。seq: [{f,t,d,type,g}, ...]
  function play(seq) {
    if (!enabled || !ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    for (var i = 0; i < seq.length; i++) {
      var n = seq[i];
      tone(n.f, n.t, n.d || 0.15, n.type, n.g);
    }
  }

  function bgmTick() {
    if (!enabled || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    tone(BGM[bgmStep % BGM.length], 0, 0.42, 'sine', 0.045); // ひかえめな音量
    bgmStep++;
  }

  function startBgm() {
    if (bgmTimer || !enabled || !ensureCtx()) return;
    bgmStep = 0;
    bgmTick();
    bgmTimer = setInterval(bgmTick, BGM_INTERVAL);
  }
  function stopBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }

  return {
    // 初期化：保存された ON/OFF を読み、最初のタッチで解錠＆BGM開始（iOS対策）
    init: function () {
      load();
      var unlock = function () {
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('touchend', unlock);
        if (ensureCtx() && ctx.state === 'suspended') ctx.resume();
        if (enabled) startBgm();
      };
      document.addEventListener('pointerdown', unlock, { once: false });
      document.addEventListener('touchend', unlock, { once: false }); // 念のため二重で
    },

    isEnabled: function () { return enabled; },

    // ON/OFF を切り替え、新しい状態を返す
    toggle: function () {
      enabled = !enabled;
      save();
      if (enabled) { ensureCtx(); startBgm(); this.tap(); }
      else { stopBgm(); }
      return enabled;
    },

    // --- 効果音 ---
    pop: function () { // アイスを積む：ぽんっと上がる
      play([{ f: 523, d: 0.08, type: 'triangle', g: 0.2 },
            { f: 784, t: 0.05, d: 0.1, type: 'triangle', g: 0.2 }]);
    },
    remove: function () { // 外す：ぽとっと下がる
      play([{ f: 440, d: 0.08, type: 'sine', g: 0.16 },
            { f: 294, t: 0.05, d: 0.12, type: 'sine', g: 0.16 }]);
    },
    wrong: function () { // はずれ：こわくない、やわらかいブブッ
      play([{ f: 220, d: 0.12, type: 'sawtooth', g: 0.1 },
            { f: 175, t: 0.1, d: 0.16, type: 'sawtooth', g: 0.1 }]);
    },
    tap: function () { // ボタン：軽いタップ音
      play([{ f: 660, d: 0.05, type: 'square', g: 0.07 }]);
    },
    combo: function (n) { // コンボ：連続が増えるほど高くなる
      var base = 660 + Math.min(n, 8) * 45;
      play([{ f: base, d: 0.07, type: 'triangle', g: 0.16 },
            { f: base * 1.25, t: 0.06, d: 0.1, type: 'triangle', g: 0.16 }]);
    },
    win: function (stars) { // クリア：星の数だけ上がっていく明るいアルペジオ
      var scale = (stars >= 3) ? [523, 659, 784, 1047]
                : (stars === 2) ? [523, 659, 784]
                :                 [523, 784];
      var seq = [];
      for (var i = 0; i < scale.length; i++) {
        seq.push({ f: scale[i], t: i * 0.12, d: 0.2, type: 'triangle', g: 0.2 });
      }
      seq.push({ f: 1568, t: scale.length * 0.12 + 0.02, d: 0.25, type: 'sine', g: 0.14 }); // 仕上げのキラッ
      play(seq);
    }
  };
})();

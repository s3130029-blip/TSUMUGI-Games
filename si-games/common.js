// SIあそび 共通モジュール — BGM / SFX / エフェクト
const SIAsobi = (() => {
  'use strict';

  // ── AudioContext ─────────────────────────────────────────────────────────
  let _ctx = null;
  function ac() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // ── BGM ──────────────────────────────────────────────────────────────────
  // C長調 ペンタトニック、BPM≈158 (BEAT=0.38s)
  const BEAT = 0.38;
  const MELODY = [
    // フレーズ A（上昇）
    {f:523,b:.5},{f:659,b:.5},{f:784,b:.5},{f:880,b:.5},
    // フレーズ A（下降）
    {f:784,b:.5},{f:659,b:.5},{f:523,b:1.0},{f:0,b:.25},
    // フレーズ B（5度上）
    {f:587,b:.5},{f:698,b:.5},{f:880,b:.5},{f:1047,b:.5},
    {f:880,b:.5},{f:698,b:.5},{f:587,b:1.0},{f:0,b:.25},
    // ブリッジ
    {f:784,b:.5},{f:659,b:.5},{f:523,b:.5},{f:659,b:.5},
    {f:784,b:.5},{f:880,b:.5},{f:784,b:1.5},{f:0,b:.5},
  ];

  let _bgmOn = false, _bgmTimer = null, _bgmIdx = 0;
  let _muted  = false;

  function _tick() {
    if (!_bgmOn || _muted) return;
    const n = MELODY[_bgmIdx];
    if (n.f > 0) {
      try {
        const A = ac();
        const o = A.createOscillator(), g = A.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(n.f, A.currentTime);
        g.gain.setValueAtTime(0, A.currentTime);
        g.gain.linearRampToValueAtTime(0.09, A.currentTime + 0.03);
        g.gain.setValueAtTime(0.09, A.currentTime + n.b * BEAT - 0.05);
        g.gain.linearRampToValueAtTime(0, A.currentTime + n.b * BEAT);
        o.connect(g); g.connect(A.destination);
        o.start(A.currentTime); o.stop(A.currentTime + n.b * BEAT + 0.05);
      } catch(e) {}
    }
    _bgmIdx = (_bgmIdx + 1) % MELODY.length;
    _bgmTimer = setTimeout(_tick, n.b * BEAT * 1000);
  }

  function startBGM() {
    if (_bgmOn || _muted) return;
    _bgmOn = true; _bgmIdx = 0; _tick();
  }
  function stopBGM() {
    _bgmOn = false;
    if (_bgmTimer) { clearTimeout(_bgmTimer); _bgmTimer = null; }
  }

  // ── SFX ──────────────────────────────────────────────────────────────────
  function correct() {
    if (_muted) return;
    try {
      const A = ac();
      // 4音の明るい上昇アルペジオ
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = A.createOscillator(), g = A.createGain();
        const t = A.currentTime + i * 0.1;
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.connect(g); g.connect(A.destination);
        o.start(t); o.stop(t + 0.35);
      });
    } catch(e) {}
  }

  function wrong() {
    if (_muted) return;
    try {
      const A = ac();
      const o = A.createOscillator(), g = A.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, A.currentTime);
      o.frequency.exponentialRampToValueAtTime(110, A.currentTime + 0.35);
      g.gain.setValueAtTime(0.2, A.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, A.currentTime + 0.35);
      o.connect(g); g.connect(A.destination);
      o.start(A.currentTime); o.stop(A.currentTime + 0.35);
    } catch(e) {}
  }

  // ── Confetti burst ────────────────────────────────────────────────────────
  const COLORS  = ['#ff7043','#ffd740','#69f0ae','#40c4ff','#ea80fc',
                   '#ff4081','#b2ff59','#ffcc02','#00e5ff','#ff6d00'];
  const N_PARTS = 30;

  function burst(el) {
    const r  = el.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;

    // 紙吹雪パーティクル
    const parts = Array.from({length: N_PARTS}, (_, i) => {
      const d   = document.createElement('div');
      const c   = COLORS[i % COLORS.length];
      const sz  = 7 + Math.random() * 9;
      const rnd = Math.random();
      d.style.cssText =
        `position:fixed;left:${cx}px;top:${cy}px;` +
        `width:${sz}px;height:${sz}px;background:${c};` +
        `border-radius:${rnd > .45 ? '50%' : rnd > .2 ? '2px' : '0'};` +
        'pointer-events:none;z-index:9999;';
      document.body.appendChild(d);

      const angle = (Math.PI * 2 * i / N_PARTS) + (Math.random() - .5) * .7;
      const spd   = 5 + Math.random() * 8;
      return {
        d, x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 5,
        rot: Math.random() * 360,
        rotV: (Math.random() - .5) * 20,
        a: 1,
      };
    });

    // ★ 星スプラッシュ (5個)
    const starParts = Array.from({length: 5}, () => {
      const d = document.createElement('div');
      d.textContent = '⭐';
      d.style.cssText =
        `position:fixed;left:${cx}px;top:${cy}px;` +
        'font-size:1.4rem;pointer-events:none;z-index:9999;';
      document.body.appendChild(d);
      const angle = Math.random() * Math.PI * 2;
      const spd   = 3 + Math.random() * 4;
      return {
        d, x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 4,
        a: 1,
      };
    });

    const tick = () => {
      let alive = false;
      parts.forEach(p => {
        if (p.a <= 0) return;
        p.vx *= .97; p.vy += .4;
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rotV; p.a -= .024;
        p.d.style.cssText +=
          `;left:${p.x}px;top:${p.y}px;opacity:${p.a};transform:rotate(${p.rot}deg)`;
        if (p.a > 0) alive = true; else p.d.remove();
      });
      starParts.forEach(p => {
        if (p.a <= 0) return;
        p.vy += .35; p.x += p.vx; p.y += p.vy; p.a -= .03;
        p.d.style.cssText += `;left:${p.x}px;top:${p.y}px;opacity:${p.a}`;
        if (p.a > 0) alive = true; else p.d.remove();
      });
      if (alive) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // 「せいかい！」テキスト
    const txt = document.createElement('div');
    txt.textContent = '✨ せいかい！';
    txt.className = 'si-seikai';
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 950);
  }

  // ── Mute ボタン ───────────────────────────────────────────────────────────
  function _addMuteBtn() {
    const btn = document.createElement('button');
    btn.id = 'si-mute';
    btn.textContent = '🔊';
    btn.title = 'おとをきる / ならす';
    document.body.appendChild(btn);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      _muted = !_muted;
      btn.textContent = _muted ? '🔇' : '🔊';
      if (_muted) stopBGM(); else startBGM();
    });
  }

  // ── 初回タップでBGM開始 ───────────────────────────────────────────────────
  let _started = false;
  function _onFirst() {
    if (_started) return;
    _started = true;
    startBGM();
    document.removeEventListener('pointerdown', _onFirst);
  }

  document.addEventListener('DOMContentLoaded', () => {
    _addMuteBtn();
    document.addEventListener('pointerdown', _onFirst);
  });

  return { correct, wrong, burst, startBGM, stopBGM };
})();

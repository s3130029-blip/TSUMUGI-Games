/* ============================================================
   sound.js  -  こうかおん(Web Audio で合成 / 外部ファイル不要)
   オフラインでも鳴る。オン/オフ切り替え可。
   ============================================================ */

export class Sound {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this._ensure();
    return this.enabled;
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  /** 単音を鳴らす */
  _beep(freq, dur = 0.12, type = 'sine', vol = 0.18) {
    if (!this.enabled) return;
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // 用途別のかわいい音
  tap()    { this._beep(660, 0.08, 'triangle'); }
  pop()    { this._beep(880, 0.10, 'sine'); }
  stamp()  { this._beep(523, 0.10, 'square', 0.12); setTimeout(() => this._beep(784, 0.12, 'square', 0.12), 60); }
  fill()   { this._beep(300, 0.18, 'sawtooth', 0.12); }
  erase()  { this._beep(200, 0.10, 'sine', 0.10); }
  save()   { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._beep(f, 0.12, 'triangle'), i * 90)); }
  clear()  { this._beep(400, 0.10, 'sine'); setTimeout(() => this._beep(250, 0.16, 'sine'), 90); }
}

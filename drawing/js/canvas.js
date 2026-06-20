/* ============================================================
   canvas.js  -  レイヤー管理
   - bg     : 背景
   - draw   : ユーザーの絵(ここに描く)
   - overlay: ぬりえの線画(常に一番上 / 描画はされない)
   論理座標(CSS px)で描き、内部解像度は devicePixelRatio 倍。
   ============================================================ */

export class Layers {
  constructor() {
    this.bg = document.getElementById('bg-layer');
    this.draw = document.getElementById('draw-layer');
    this.overlay = document.getElementById('overlay-layer');
    this.stage = document.getElementById('stage');

    this.bgCtx = this.bg.getContext('2d');
    this.ctx = this.draw.getContext('2d', { willReadFrequently: true });
    this.overlayCtx = this.overlay.getContext('2d');

    // メモリを抑えるため DPR は最大 2 に制限
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;   // 論理サイズ
    this.height = 0;
    this.background = null;        // 現在の背景設定
    this.templateImg = null;       // 現在のぬりえ画像(Image)

    this._onResize = null;
  }

  /** 3レイヤーをステージサイズに合わせる(中身は保持) */
  resize() {
    const rect = this.stage.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === this.width && h === this.height) return;

    // 既存のユーザー絵を退避
    const snapshot = this.width > 0 ? this._snapshot(this.draw) : null;

    this.width = w;
    this.height = h;
    for (const c of [this.bg, this.draw, this.overlay]) {
      c.width = Math.round(w * this.dpr);
      c.height = Math.round(h * this.dpr);
    }
    for (const ctx of [this.bgCtx, this.ctx, this.overlayCtx]) {
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // 退避した絵を引き伸ばして戻す
    if (snapshot) {
      this.ctx.drawImage(snapshot, 0, 0, w, h);
    }
    this.renderBackground();
    this.renderTemplate();

    if (this._onResize) this._onResize();
  }

  /** リサイズ後に呼ぶコールバック(履歴初期化用) */
  onResize(fn) { this._onResize = fn; }

  _snapshot(canvas) {
    const t = document.createElement('canvas');
    t.width = canvas.width;
    t.height = canvas.height;
    t.getContext('2d').drawImage(canvas, 0, 0);
    return t;
  }

  // ---------- 背景 ----------
  setBackground(bg) {
    this.background = bg;
    this.renderBackground();
  }

  renderBackground() {
    const { bgCtx: g, width: w, height: h } = this;
    g.clearRect(0, 0, w, h);
    const bg = this.background;
    if (!bg) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); return; }

    if (bg.type === 'color') {
      g.fillStyle = bg.value;
      g.fillRect(0, 0, w, h);
    } else if (bg.type === 'grid') {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      g.strokeStyle = bg.value; g.lineWidth = 1.5;
      const step = 32;
      g.beginPath();
      for (let x = 0; x <= w; x += step) { g.moveTo(x, 0); g.lineTo(x, h); }
      for (let y = 0; y <= h; y += step) { g.moveTo(0, y); g.lineTo(w, y); }
      g.stroke();
    } else if (bg.type === 'dots') {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      g.fillStyle = bg.value;
      const step = 40, r = 6;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
      }
    }
  }

  // ---------- ぬりえ(オーバーレイ線画) ----------
  setTemplate(img) {
    this.templateImg = img;   // null でクリア
    this.renderTemplate();
  }

  renderTemplate() {
    const { overlayCtx: g, width: w, height: h } = this;
    g.clearRect(0, 0, w, h);
    if (!this.templateImg) return;
    // 中央に最大サイズで収める
    const margin = 0.85;
    const size = Math.min(w, h) * margin;
    const x = (w - size) / 2;
    const y = (h - size) / 2;
    g.drawImage(this.templateImg, x, y, size, size);
  }

  // ---------- ユーザー絵 ----------
  clearDrawing() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /** 保存用に 3レイヤーを 1枚に合成して返す */
  flatten() {
    const out = document.createElement('canvas');
    out.width = this.draw.width;
    out.height = this.draw.height;
    const g = out.getContext('2d');
    g.drawImage(this.bg, 0, 0);
    g.drawImage(this.draw, 0, 0);
    g.drawImage(this.overlay, 0, 0);
    return out;
  }
}

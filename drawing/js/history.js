/* ============================================================
   history.js  -  もどる / やりなおし
   draw レイヤーのスナップショット(PNG dataURL)を積む方式。
   PNG は透明部分が圧縮されるためメモリに優しく、
   描画・スタンプ・ぬりつぶしを同じ仕組みで扱える。
   ============================================================ */

const MAX_STEPS = 25;

export class History {
  /** @param {HTMLCanvasElement} canvas  draw レイヤー */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stack = [];
    this.index = -1;
    this._token = 0;       // 非同期復元の競合対策
    this.onChange = null;  // ボタン活性更新コールバック
  }

  /** 現在の状態を1つ積む(空状態の初期化にも使う) */
  push() {
    const url = this.canvas.toDataURL('image/png');
    // redo 分を捨てる
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(url);
    if (this.stack.length > MAX_STEPS) this.stack.shift();
    this.index = this.stack.length - 1;
    this._notify();
  }

  canUndo() { return this.index > 0; }
  canRedo() { return this.index < this.stack.length - 1; }

  undo() { if (this.canUndo()) { this.index--; this._restore(); } }
  redo() { if (this.canRedo()) { this.index++; this._restore(); } }

  /** スタック全消し → まっさらを1枚積む */
  reset() {
    this.stack = [];
    this.index = -1;
    this.push();
  }

  _restore() {
    const url = this.stack[this.index];
    const token = ++this._token;
    const img = new Image();
    img.onload = () => {
      if (token !== this._token) return; // 古い復元は無視
      const c = this.canvas;
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 物理ピクセルで上書き
      this.ctx.clearRect(0, 0, c.width, c.height);
      this.ctx.drawImage(img, 0, 0, c.width, c.height);
      this.ctx.restore();
      this._notify();
    };
    img.src = url;
    this._notify();
  }

  _notify() { if (this.onChange) this.onChange(this.canUndo(), this.canRedo()); }
}

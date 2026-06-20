/* ============================================================
   fill.js  -  バケツ塗り(フラッドフィル)
   背景 + ユーザー絵 + ぬりえ線画 を合成した画像で領域を判定し、
   その領域を draw レイヤーに塗る。
   → ぬりえの黒い線や、自分で描いた線が「かべ」になる。
   ============================================================ */

/**
 * @param {Layers} layers
 * @param {number} cssX  論理座標(CSS px)
 * @param {number} cssY
 * @param {string} hexColor  '#rrggbb'
 */
export function bucketFill(layers, cssX, cssY, hexColor) {
  const { dpr } = layers;
  const W = layers.draw.width;   // 物理ピクセル
  const H = layers.draw.height;
  const sx = Math.floor(cssX * dpr);
  const sy = Math.floor(cssY * dpr);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;

  // 合成画像(判定用)を作る
  const probe = document.createElement('canvas');
  probe.width = W; probe.height = H;
  const pg = probe.getContext('2d', { willReadFrequently: true });
  pg.drawImage(layers.bg, 0, 0);
  pg.drawImage(layers.draw, 0, 0);
  pg.drawImage(layers.overlay, 0, 0);
  const src = pg.getImageData(0, 0, W, H);
  const data = src.data;

  // ぬりえの線は塗りつぶさない(線を残す)ためのマスク
  const overlayG = document.createElement('canvas');
  overlayG.width = W; overlayG.height = H;
  const og = overlayG.getContext('2d', { willReadFrequently: true });
  og.drawImage(layers.overlay, 0, 0);
  const overlayData = og.getImageData(0, 0, W, H).data;

  const start = (sy * W + sx) * 4;
  const tr = data[start], tg = data[start + 1], tb = data[start + 2], ta = data[start + 3];

  const fill = hexToRgb(hexColor);
  // 同じ色を塗ろうとしたら何もしない
  if (Math.abs(tr - fill.r) < 4 && Math.abs(tg - fill.g) < 4 &&
      Math.abs(tb - fill.b) < 4 && ta === 255) return;

  const TOL = 48; // 色の許容差(アンチエイリアス対策)
  const match = (i) => {
    const dr = data[i] - tr, dg = data[i + 1] - tg, db = data[i + 2] - tb, da = data[i + 3] - ta;
    return dr * dr + dg * dg + db * db + da * da <= TOL * TOL;
  };

  // 塗る領域を集める(走査線方式)
  const out = layers.ctx.getImageData(0, 0, W, H);
  const od = out.data;
  const visited = new Uint8Array(W * H);
  const stack = [[sx, sy]];

  while (stack.length) {
    const [x0, y] = stack.pop();
    let x = x0;
    while (x >= 0 && !visited[y * W + x] && match((y * W + x) * 4)) x--;
    x++;
    let spanUp = false, spanDown = false;
    while (x < W && !visited[y * W + x] && match((y * W + x) * 4)) {
      const p = y * W + x;
      visited[p] = 1;
      const oi = p * 4;
      // ぬりえ線(オーバーレイが不透明)の上には塗らない
      if (overlayData[oi + 3] < 40) {
        od[oi] = fill.r; od[oi + 1] = fill.g; od[oi + 2] = fill.b; od[oi + 3] = 255;
      }
      if (y > 0) {
        const up = (y - 1) * W + x;
        if (!visited[up] && match(up * 4)) {
          if (!spanUp) { stack.push([x, y - 1]); spanUp = true; }
        } else spanUp = false;
      }
      if (y < H - 1) {
        const dn = (y + 1) * W + x;
        if (!visited[dn] && match(dn * 4)) {
          if (!spanDown) { stack.push([x, y + 1]); spanDown = true; }
        } else spanDown = false;
      }
      x++;
    }
  }

  layers.ctx.save();
  layers.ctx.setTransform(1, 0, 0, 1, 0, 0);
  layers.ctx.putImageData(out, 0, 0);
  layers.ctx.restore();
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

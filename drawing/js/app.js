/* ============================================================
   app.js  -  メイン制御
   各モジュールをつないで、ツール・描画・UI を動かす。
   ============================================================ */

import { COLORS, SIZES, STAMPS, BACKGROUNDS, TEMPLATES, TOOLS } from './data.js';
import { Layers } from './canvas.js';
import { History } from './history.js';
import { bucketFill } from './fill.js';
import { Sound } from './sound.js';

const DRAW_TOOLS = ['pen', 'rainbow', 'eraser', 'fill', 'stamp'];

// ---------- 状態 ----------
const state = {
  tool: 'pen',
  color: '#ff3b30',     // さいしょは あか
  size: SIZES[1],
  stamp: STAMPS[0],
  randomStamp: false,
};

const layers = new Layers();
const sound = new Sound();
let history;

// 描画中の一時状態
const stroke = { active: false, pointerId: null, x: 0, y: 0, hue: 0, moved: false, lastStampX: 0, lastStampY: 0 };

// ---------- 初期化 ----------
function init() {
  buildTools();
  buildPalette();
  buildSizes();

  layers.setBackground(BACKGROUNDS[0]);
  layers.resize();

  history = new History(layers.draw);
  history.onChange = updateUndoRedo;
  history.reset();

  bindPointer();
  bindButtons();
  selectTool('pen');

  // 初期の いろ・ふとさ をハイライト
  document.querySelector(`.swatch[data-color="${state.color}"]`)?.classList.add('selected');
  document.querySelector(`.size-btn[data-size="${state.size}"]`)?.classList.add('selected');

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  registerServiceWorker();
}

function onResize() {
  layers.resize();
}

// ---------- UI 構築 ----------
function buildTools() {
  const wrap = document.getElementById('tools');
  wrap.innerHTML = '';
  for (const t of TOOLS) {
    const b = document.createElement('button');
    b.className = 'btn tool';
    b.dataset.tool = t.id;
    b.innerHTML = `<span class="ico">${t.icon}</span><span class="lbl">${t.label}</span>`;
    b.addEventListener('click', () => onToolClick(t.id));
    wrap.appendChild(b);
  }
}

function buildPalette() {
  const wrap = document.getElementById('palette');
  wrap.innerHTML = '';
  for (const c of COLORS) {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = c;
    b.dataset.color = c;
    b.addEventListener('click', () => onColorClick(c, b));
    wrap.appendChild(b);
  }
}

function buildSizes() {
  const wrap = document.getElementById('sizes');
  wrap.innerHTML = '';
  for (const s of SIZES) {
    const b = document.createElement('button');
    b.className = 'size-btn';
    b.dataset.size = s;
    const d = Math.max(8, Math.min(s, 30));
    b.innerHTML = `<span class="dot" style="width:${d}px;height:${d}px"></span>`;
    b.addEventListener('click', () => onSizeClick(s, b));
    wrap.appendChild(b);
  }
}

// ---------- ツール選択 ----------
function onToolClick(id) {
  sound.tap();
  if (id === 'coloring') { openTemplatePanel(); return; }
  if (id === 'background') { openBackgroundPanel(); return; }
  selectTool(id);
  if (id === 'stamp') openStampPanel();
  else closePanel();
}

function selectTool(id) {
  state.tool = id;
  document.querySelectorAll('.tool').forEach((b) =>
    b.classList.toggle('selected', b.dataset.tool === id && DRAW_TOOLS.includes(id))
  );
}

function onColorClick(c, btn) {
  sound.pop();
  state.color = c;
  document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('selected', s === btn));
  // 色を選んだら描けるツールに戻す
  if (state.tool === 'eraser' || state.tool === 'rainbow') selectTool('pen');
}

function onSizeClick(s, btn) {
  sound.pop();
  state.size = s;
  document.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('selected', b === btn));
}

// ---------- ポインタ(描画) ----------
function bindPointer() {
  const el = layers.draw;
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

function getPoint(e) {
  const r = layers.draw.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onPointerDown(e) {
  if (stroke.active) return;            // 同時に1本だけ(誤操作防止)
  e.preventDefault();
  sound._ensure();                      // 最初のタッチで音声を有効化
  layers.draw.setPointerCapture(e.pointerId);
  stroke.active = true;
  stroke.pointerId = e.pointerId;
  stroke.moved = false;

  const p = getPoint(e);
  stroke.x = p.x; stroke.y = p.y;
  stroke.hue = Math.floor(Math.random() * 360);

  if (state.tool === 'fill') {
    bucketFill(layers, p.x, p.y, state.color);
    sound.fill();
    return; // up で push
  }
  if (state.tool === 'stamp') {
    placeStamp(p.x, p.y);
    stroke.lastStampX = p.x; stroke.lastStampY = p.y;
    return;
  }
  // ペン / にじいろ / けしごむ → 点(タップ)を打つ
  drawDot(p.x, p.y);
}

function onPointerMove(e) {
  if (!stroke.active || e.pointerId !== stroke.pointerId) return;
  e.preventDefault();
  stroke.moved = true;

  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of events) {
    const p = getPoint(ev);
    if (state.tool === 'fill') continue;
    if (state.tool === 'stamp') {
      const dx = p.x - stroke.lastStampX, dy = p.y - stroke.lastStampY;
      const spacing = stampSize() * 0.9;
      if (dx * dx + dy * dy >= spacing * spacing) {
        placeStamp(p.x, p.y);
        stroke.lastStampX = p.x; stroke.lastStampY = p.y;
      }
      continue;
    }
    drawSegment(stroke.x, stroke.y, p.x, p.y);
    stroke.x = p.x; stroke.y = p.y;
  }
}

function onPointerUp(e) {
  if (!stroke.active || e.pointerId !== stroke.pointerId) return;
  stroke.active = false;
  stroke.pointerId = null;
  try { layers.draw.releasePointerCapture(e.pointerId); } catch {}
  // 何か変化したら履歴に積む
  history.push();
}

// ---------- 描画プリミティブ ----------
function strokeStyleNow() {
  if (state.tool === 'rainbow') {
    stroke.hue = (stroke.hue + 6) % 360;
    return `hsl(${stroke.hue}, 90%, 55%)`;
  }
  return state.color;
}

function applyMode(ctx) {
  if (state.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
}

function drawDot(x, y) {
  const ctx = layers.ctx;
  applyMode(ctx);
  ctx.fillStyle = state.tool === 'eraser' ? 'rgba(0,0,0,1)' : strokeStyleNow();
  ctx.beginPath();
  ctx.arc(x, y, state.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function drawSegment(x0, y0, x1, y1) {
  const ctx = layers.ctx;
  applyMode(ctx);
  ctx.strokeStyle = state.tool === 'eraser' ? 'rgba(0,0,0,1)' : strokeStyleNow();
  ctx.lineWidth = state.size;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

function stampSize() {
  return state.size * 2.5 + 40;
}

function placeStamp(x, y) {
  const ctx = layers.ctx;
  const emoji = state.randomStamp ? STAMPS[Math.floor(Math.random() * STAMPS.length)] : state.stamp;
  const px = stampSize();
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.font = `${px}px "Apple Color Emoji","Segoe UI Emoji",serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
  ctx.restore();
  sound.stamp();
}

// ---------- パネル(スタンプ/ぬりえ/はいけい) ----------
function openPanel(title) {
  document.getElementById('panel-title').textContent = title;
  const panel = document.getElementById('panel');
  panel.classList.remove('hidden');
  panel.setAttribute('aria-hidden', 'false');
}
function closePanel() {
  const panel = document.getElementById('panel');
  panel.classList.add('hidden');
  panel.setAttribute('aria-hidden', 'true');
}

function openStampPanel() {
  openPanel('スタンプ');
  const body = document.getElementById('panel-body');
  body.innerHTML = '';

  // ランダム スタンプ
  const rnd = document.createElement('button');
  rnd.className = 'pitem' + (state.randomStamp ? ' selected' : '');
  rnd.innerHTML = '🎲';
  rnd.title = 'ランダム';
  rnd.addEventListener('click', () => {
    state.randomStamp = true;
    sound.pop();
    body.querySelectorAll('.pitem').forEach((i) => i.classList.remove('selected'));
    rnd.classList.add('selected');
  });
  body.appendChild(rnd);

  for (const s of STAMPS) {
    const b = document.createElement('button');
    b.className = 'pitem' + (!state.randomStamp && state.stamp === s ? ' selected' : '');
    b.textContent = s;
    b.addEventListener('click', () => {
      state.stamp = s;
      state.randomStamp = false;
      sound.pop();
      body.querySelectorAll('.pitem').forEach((i) => i.classList.remove('selected'));
      b.classList.add('selected');
    });
    body.appendChild(b);
  }
}

function openTemplatePanel() {
  openPanel('ぬりえ');
  const body = document.getElementById('panel-body');
  body.innerHTML = '';

  // 「なし」(線画クリア)
  const none = document.createElement('button');
  none.className = 'pitem';
  none.innerHTML = '🚫';
  none.title = 'なし';
  none.addEventListener('click', () => {
    layers.setTemplate(null);
    sound.pop();
    closePanel();
    selectTool('pen');
  });
  body.appendChild(none);

  for (const t of TEMPLATES) {
    const b = document.createElement('button');
    b.className = 'pitem';
    b.innerHTML = t.svg;
    b.title = t.label;
    b.addEventListener('click', () => {
      loadTemplate(t);
      sound.pop();
      closePanel();
      selectTool('pen'); // 線画を選んだら ペンで色を塗れるように
    });
    body.appendChild(b);
  }
}

function loadTemplate(t) {
  const img = new Image();
  img.onload = () => layers.setTemplate(img);
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(t.svg);
}

function openBackgroundPanel() {
  openPanel('はいけい');
  const body = document.getElementById('panel-body');
  body.innerHTML = '';
  for (const bg of BACKGROUNDS) {
    const b = document.createElement('button');
    b.className = 'pitem';
    b.style.background = bg.value;
    b.style.fontSize = '13px';
    b.style.fontWeight = '800';
    b.style.color = bg.id === 'night' ? '#fff' : '#555';
    b.textContent = bg.label;
    b.addEventListener('click', () => {
      layers.setBackground(bg);
      sound.pop();
      closePanel();
    });
    body.appendChild(b);
  }
}

// ---------- 上部アクション ----------
function bindButtons() {
  document.querySelectorAll('[data-action]').forEach((b) => {
    b.addEventListener('click', () => handleAction(b.dataset.action));
  });
}

function handleAction(action) {
  switch (action) {
    case 'undo': sound.tap(); history.undo(); break;
    case 'redo': sound.tap(); history.redo(); break;
    case 'clear': askClear(); break;
    case 'save': savePng(); break;
    case 'sound': toggleSound(); break;
    case 'fullscreen': toggleFullscreen(); break;
    case 'close-panel': sound.tap(); closePanel(); break;
    case 'modal-yes': doClear(); break;
    case 'modal-no': hideModal(); break;
  }
}

function updateUndoRedo(canUndo, canRedo) {
  const u = document.querySelector('[data-action="undo"]');
  const r = document.querySelector('[data-action="redo"]');
  if (u) u.classList.toggle('is-disabled', !canUndo);
  if (r) r.classList.toggle('is-disabled', !canRedo);
}

// 全消し(確認モーダル)
function askClear() {
  sound.tap();
  document.getElementById('modal').classList.remove('hidden');
}
function hideModal() {
  document.getElementById('modal').classList.add('hidden');
}
function doClear() {
  hideModal();
  layers.clearDrawing();
  history.push();
  sound.clear();
}

// PNG 保存
function savePng() {
  sound.save();
  const out = layers.flatten();
  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oekaki-${timestamp()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

// 音 オン/オフ
function toggleSound() {
  const on = sound.toggle();
  const btn = document.querySelector('[data-action="sound"]');
  if (btn) {
    btn.querySelector('.ico').textContent = on ? '🔊' : '🔈';
    btn.querySelector('.lbl').textContent = on ? 'おと' : 'むおん';
  }
  if (on) sound.pop();
}

// フルスクリーン
function toggleFullscreen() {
  sound.tap();
  const doc = document;
  const el = document.documentElement;
  if (!doc.fullscreenElement) {
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } else {
    (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
  }
}

// ---------- Service Worker(オフライン対応) ----------
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
}

window.addEventListener('DOMContentLoaded', init);

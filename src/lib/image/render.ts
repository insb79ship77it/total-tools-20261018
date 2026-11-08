// 이미지 위에 글씨·박스·워터마크를 그리는 코드와 글꼴 목록입니다. (화면과 무관한 순수 그리기 로직)
export type Img = { src: CanvasImageSource; w: number; h: number };
export type Sec = {
  text: string; font: string; weight: number; size: number; color: string; accent: string; hl: string;
  lh: number; ls: number; align: 'left' | 'center' | 'right'; x: number; y: number;
  stroke: boolean; strokeColor: string; strokeW: number;
  shadow: boolean; shadowColor: string; shadowBlur: number; shadowDist: number;
  box: 'none' | 'box' | 'band'; boxColor: string; boxAlpha: number; boxRadius: number;
  padT: number; padB: number; padL: number; padR: number;
  img: Img | null; imgSize: number; imgPos: 'left' | 'top' | 'bottom';
};
export type Wm = { text: string; font: string; weight: number; color: string; size: number; alpha: number; angle: number; gap: number };

export const FONTS: { id: string; name: string; css: string; faces?: Record<number, string> }[] = [
  { id: 'pretendard', name: '프리텐다드', css: '"Pretendard Variable", Pretendard' },
  { id: 'noto', name: '노토 산스', css: '"Noto Sans KR"' },
  { id: 'nanumg', name: '나눔고딕', css: '"Nanum Gothic"' },
  { id: 'nanumm', name: '나눔명조', css: '"Nanum Myeongjo"' },
  { id: 'pen', name: '나눔손글씨 펜', css: '"Nanum Pen Script"' },
  { id: 'blackhan', name: '블랙한산스', css: '"Black Han Sans"' },
  { id: 'jua', name: '주아', css: '"Jua"' },
  { id: 'dohyeon', name: '도현', css: '"Do Hyeon"' },
  { id: 'score', name: '에스코어 드림', css: '"S-CoreDream-6Bold"', faces: { 400: 'S-CoreDream-4Regular', 500: 'S-CoreDream-5Medium', 700: 'S-CoreDream-6Bold', 900: 'S-CoreDream-9Black' } },
  { id: 'gmarket', name: 'G마켓 산스', css: '"GmarketSans"' },
  { id: 'paperlogy', name: '페이퍼로지', css: '"Paperlogy"' },
  { id: 'poppins', name: 'Poppins (영문)', css: '"Poppins"' },
  { id: 'montserrat', name: 'Montserrat (영문)', css: '"Montserrat"' },
];
// 굵기별로 글꼴 이름이 따로 있는 글꼴(에스코어 드림)은 가장 가까운 굵기의 이름을 씁니다.
export function fontStr(id: string, weight: number, px: number) {
  const f = FONTS.find((x) => x.id === id) || FONTS[0];
  if (f.faces) {
    const keys = Object.keys(f.faces).map(Number);
    const k = keys.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
    return `400 ${px}px "${f.faces[k]}", sans-serif`;
  }
  return `${weight} ${px}px ${f.css}, sans-serif`;
}
const hexA = (h: string, a: number) => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// [[강조 박스]] , {{강조 글자색}} 을 조각으로 나눕니다.
type Run = { t: string; k: 'n' | 'a' | 'b' };
function parseRuns(line: string): Run[] {
  const runs: Run[] = [];
  const re = /\[\[(.+?)\]\]|\{\{(.+?)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) runs.push({ t: line.slice(last, m.index), k: 'n' });
    runs.push(m[1] !== undefined ? { t: m[1], k: 'b' } : { t: m[2], k: 'a' });
    last = re.lastIndex;
  }
  if (last < line.length) runs.push({ t: line.slice(last), k: 'n' });
  return runs;
}

function measure(ctx: CanvasRenderingContext2D, t: string, ls: number) {
  if (!ls) return ctx.measureText(t).width;
  let w = 0;
  for (const ch of t) w += ctx.measureText(ch).width + ls;
  return w;
}

function put(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, ls: number, stroke: boolean) {
  const f = stroke ? ctx.strokeText.bind(ctx) : ctx.fillText.bind(ctx);
  if (!ls) { f(t, x, y); return; }
  let cx = x;
  for (const ch of t) { f(ch, cx, y); cx += ctx.measureText(ch).width + ls; }
}

function drawSection(ctx: CanvasRenderingContext2D, s: Sec, W: number, H: number) {
  const lines = s.text.replace(/\s+$/, '').split(/\r?\n/);
  const hasText = s.text.trim() !== '';
  if (!hasText && !s.img) return;

  const sc = W / 1000;
  const fs = (s.size / 100) * W;
  const lh = fs * s.lh;
  const ls = s.ls * sc;
  const hlPad = fs * 0.25;
  ctx.save();
  ctx.font = fontStr(s.font, s.weight, fs);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const rows = hasText
    ? lines.map((l) => {
        const runs = parseRuns(l);
        const w = runs.reduce((a, r) => a + measure(ctx, r.t, ls) + (r.k === 'b' ? hlPad * 2 : 0), 0);
        return { runs, w };
      })
    : [];
  const textW = rows.reduce((a, r) => Math.max(a, r.w), 0);
  const textH = rows.length * lh;

  let iw = 0, ih = 0;
  if (s.img) { iw = (s.imgSize / 100) * W; ih = (iw * s.img.h) / s.img.w; }
  const gap = fs * 0.4;
  let cw: number, ch: number;
  if (!s.img) { cw = textW; ch = textH; }
  else if (!rows.length) { cw = iw; ch = ih; }
  else if (s.imgPos === 'left') { cw = iw + gap + textW; ch = Math.max(ih, textH); }
  else { cw = Math.max(iw, textW); ch = ih + gap + textH; }

  const pT = (fs * s.padT) / 100, pB = (fs * s.padB) / 100, pL = (fs * s.padL) / 100, pR = (fs * s.padR) / 100;
  const band = s.box === 'band';
  const bw = band ? W : cw + pL + pR;
  const bh = ch + pT + pB;
  const cx = (s.x / 100) * W;
  const cy = (s.y / 100) * H;
  const bx = band ? 0 : cx - bw / 2;
  const by = cy - bh / 2;
  const ox = band ? cx - cw / 2 : bx + pL;
  const oy = by + pT;

  if (s.box !== 'none') {
    ctx.save();
    ctx.globalAlpha = s.boxAlpha / 100;
    ctx.fillStyle = s.boxColor;
    if (band) ctx.fillRect(bx, by, bw, bh);
    else { rrect(ctx, bx, by, bw, bh, (s.boxRadius / 100) * (bh / 2)); ctx.fill(); }
    ctx.restore();
  }

  // 이미지와 글씨 자리
  let ix = ox, iy = oy, tx = ox, ty = oy;
  if (s.img && rows.length) {
    if (s.imgPos === 'left') { iy = oy + (ch - ih) / 2; tx = ox + iw + gap; ty = oy + (ch - textH) / 2; }
    else if (s.imgPos === 'top') { ix = ox + (cw - iw) / 2; ty = oy + ih + gap; tx = ox + (cw - textW) / 2; }
    else { ix = ox + (cw - iw) / 2; ty = oy; tx = ox + (cw - textW) / 2; iy = oy + textH + gap; }
  } else if (s.img) {
    ix = ox + (cw - iw) / 2;
  } else {
    tx = ox + (cw - textW) / 2;
  }
  if (s.img) ctx.drawImage(s.img.src, ix, iy, iw, ih);

  const useStroke = s.stroke && s.strokeW > 0;
  const setShadow = () => {
    ctx.shadowColor = hexA(s.shadowColor, 0.65);
    ctx.shadowBlur = s.shadowBlur * sc;
    ctx.shadowOffsetX = s.shadowDist * sc;
    ctx.shadowOffsetY = s.shadowDist * sc;
  };
  const clearShadow = () => {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  rows.forEach((row, i) => {
    const ly = ty + lh * (i + 0.5);
    let x = s.align === 'left' ? tx : s.align === 'right' ? tx + textW - row.w : tx + (textW - row.w) / 2;
    for (const r of row.runs) {
      const rw = measure(ctx, r.t, ls);
      if (r.k === 'b') {
        ctx.fillStyle = s.hl;
        ctx.fillRect(x, ly - lh * 0.46, rw + hlPad * 2, lh * 0.92);
        x += hlPad;
      }
      if (useStroke) {
        ctx.lineWidth = s.strokeW * sc * 2;
        ctx.strokeStyle = s.strokeColor;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        if (s.shadow) setShadow();
        put(ctx, r.t, x, ly, ls, true);
        clearShadow();
      }
      ctx.fillStyle = r.k === 'a' ? s.accent : s.color;
      if (s.shadow && !useStroke) setShadow();
      put(ctx, r.t, x, ly, ls, false);
      clearShadow();
      x += rw + (r.k === 'b' ? hlPad : 0);
    }
  });
  ctx.restore();
}

function drawTile(ctx: CanvasRenderingContext2D, W: number, H: number, wm: Wm) {
  if (!wm.text.trim()) return;
  const fs = (wm.size / 100) * W;
  ctx.save();
  ctx.globalAlpha = wm.alpha / 100;
  ctx.font = fontStr(wm.font, wm.weight, fs);
  ctx.fillStyle = wm.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(W / 2, H / 2);
  ctx.rotate((wm.angle * Math.PI) / 180);
  const tw = Math.max(fs, ctx.measureText(wm.text).width + (wm.gap / 100) * W);
  const th = Math.max(fs * 1.2, fs * 1.6 + (wm.gap / 100) * W * 0.6);
  const R = Math.hypot(W, H) / 2 + tw;
  let row = 0;
  for (let y = -R; y <= R; y += th, row++) {
    for (let x = -R + (row % 2 ? tw / 2 : 0); x <= R; x += tw) ctx.fillText(wm.text, x, y);
  }
  ctx.restore();
}

export function compose(ctx: CanvasRenderingContext2D, src: CanvasImageSource | null, W: number, H: number, bg: string | null, secs: Sec[], wm: Wm) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
  if (src) ctx.drawImage(src, 0, 0, W, H);
  else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#5b7db1');
    g.addColorStop(1, '#2c3e63');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  drawTile(ctx, W, H, wm);
  for (const s of secs) drawSection(ctx, s, W, H);
  ctx.restore();
}

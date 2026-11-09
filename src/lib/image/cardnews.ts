// 카드뉴스용 단순 배경(SVG) 모음입니다. 스타일을 추가하려면 CARD_STYLES 목록에 한 줄을 넣으세요.
// 색은 네 가지 역할이에요: bg(바탕) · card(카드/종이) · accent(포인트) · sub(보조)
export type CardColors = { bg: string; card: string; accent: string; sub: string };
type CC = { w: number; h: number; u: number; x0: number; y0: number; cw: number; ch: number; c: CardColors };

const n1 = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = '') =>
  `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(rx)}" fill="${fill}"${extra}/>`;
const shadow = (k: CC, rx: number, d = 12) => rect(k.x0 + d * k.u, k.y0 + d * k.u, k.cw, k.ch, '#000000', rx, ' opacity=".10"');
const clip = (id: string, x: number, y: number, w: number, h: number, rx: number) =>
  `<clipPath id="${id}"><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(rx)}"/></clipPath>`;
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw: number, extra = '') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="${stroke}" stroke-width="${n1(sw)}"${extra}/>`;

export const CARD_STYLES: [string, string, (k: CC) => string][] = [
  ['spring', '스프링 노트', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const n = Math.max(4, Math.round(ch / (75 * u)));
    const step = (ch - 110 * u) / (n - 1);
    let rings = '', holes = '';
    for (let i = 0; i < n; i++) {
      const cy = y0 + 55 * u + i * step;
      rings += `<ellipse cx="${n1(x0 + 4 * u)}" cy="${n1(cy)}" rx="${n1(36 * u)}" ry="${n1(13 * u)}" fill="none" stroke="${c.accent}" stroke-width="${n1(7 * u)}"/>`;
      holes += `<circle cx="${n1(x0 + 34 * u)}" cy="${n1(cy)}" r="${n1(7 * u)}" fill="${c.bg}"/>`;
    }
    return shadow(k, 28 * u) + rings + rect(x0, y0, cw, ch, c.card, 28 * u) + holes;
  }],
  ['topring', '위쪽 링 노트', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const xs = [0.14, 0.86].map((r) => x0 + cw * r);
    const rings = xs.map((x) => `<ellipse cx="${n1(x)}" cy="${n1(y0 + 4 * u)}" rx="${n1(13 * u)}" ry="${n1(36 * u)}" fill="none" stroke="${c.accent}" stroke-width="${n1(7 * u)}"/>`).join('');
    const holes = xs.map((x) => `<circle cx="${n1(x)}" cy="${n1(y0 + 34 * u)}" r="${n1(7 * u)}" fill="${c.bg}"/>`).join('');
    return shadow(k, 30 * u) + rings + rect(x0, y0, cw, ch, c.card, 30 * u) + clip('cp', x0, y0, cw, ch, 30 * u)
      + `<g clip-path="url(#cp)">${rect(x0, y0, cw, ch * 0.13, c.sub)}</g>` + holes;
  }],
  ['clip', '바인더 클립', (k) => {
    const { u, w, x0, y0, cw, ch, c } = k;
    const cx = w / 2;
    const wire = `<path d="M${n1(cx - 64 * u)} ${n1(y0 - 6 * u)}C${n1(cx - 64 * u)} ${n1(y0 - 92 * u)} ${n1(cx + 64 * u)} ${n1(y0 - 92 * u)} ${n1(cx + 64 * u)} ${n1(y0 - 6 * u)}" fill="none" stroke="${c.sub}" stroke-width="${n1(7 * u)}" stroke-linecap="round"/>`;
    return shadow(k, 26 * u) + wire + rect(x0, y0, cw, ch, c.card, 26 * u)
      + rect(cx - 96 * u, y0 - 18 * u, 192 * u, 74 * u, c.accent, 12 * u) + rect(cx - 44 * u, y0 - 2 * u, 88 * u, 10 * u, c.sub, 5 * u);
  }],
  ['browser', '브라우저 창', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const dots = [0, 1, 2].map((i) => `<circle cx="${n1(x0 + cw - (46 + i * 40) * u)}" cy="${n1(y0 + 32 * u)}" r="${n1(9 * u)}" fill="${c.accent}"/>`).join('');
    return rect(x0 + 18 * u, y0 + 18 * u, cw, ch, c.accent)
      + rect(x0, y0, cw, ch, c.card, 0, ` stroke="${c.accent}" stroke-width="${n1(6 * u)}"`)
      + line(x0, y0 + 64 * u, x0 + cw, y0 + 64 * u, c.accent, 6 * u)
      + rect(x0 + 24 * u, y0 + 20 * u, cw * 0.32, 24 * u, c.sub, 12 * u) + dots;
  }],
  ['bracket', '코너 괄호', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const p = 62 * u, a = 170 * u, x1 = x0 + cw, y1 = y0 + ch;
    const L = (d: string) => `<path d="${d}" fill="none" stroke="${c.accent}" stroke-width="${n1(20 * u)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return shadow(k, 36 * u) + rect(x0, y0, cw, ch, c.card, 36 * u)
      + L(`M${n1(x0 + p)} ${n1(y0 + p + a)}V${n1(y0 + p)}H${n1(x0 + p + a)}`)
      + L(`M${n1(x1 - p - a)} ${n1(y0 + p)}H${n1(x1 - p)}V${n1(y0 + p + a)}`)
      + L(`M${n1(x0 + p)} ${n1(y1 - p - a)}V${n1(y1 - p)}H${n1(x0 + p + a)}`)
      + L(`M${n1(x1 - p - a)} ${n1(y1 - p)}H${n1(x1 - p)}V${n1(y1 - p - a)}`);
  }],
  ['block', '포인트 블록', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    return rect(x0 + 26 * u, y0 - 26 * u, cw, ch, c.accent, 30 * u)
      + rect(x0, y0, cw, ch, c.card, 30 * u, ` stroke="${c.accent}" stroke-width="${n1(5 * u)}"`);
  }],
  ['bars', '컬러 바 프레임', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const seg = cw / 3;
    const cols = [c.accent, c.sub, c.bg];
    return rect(x0, y0, cw, ch, c.card, 44 * u) + clip('cb', x0, y0, cw, ch, 44 * u)
      + `<g clip-path="url(#cb)">${cols.map((col, i) => rect(x0 + seg * i, y0, seg + 1, 30 * u, col)).join('')}</g>`
      + rect(x0, y0, cw, ch, 'none', 44 * u, ` stroke="${c.accent}" stroke-width="${n1(14 * u)}"`);
  }],
  ['pin', '핀 카드', (k) => {
    const { u, w, x0, y0, cw, ch, c } = k;
    const cx = w / 2, py = y0 + 34 * u;
    return line(cx, 0, cx, py, c.accent, 5 * u) + shadow(k, 26 * u) + rect(x0, y0, cw, ch, c.card, 26 * u)
      + `<circle cx="${n1(cx)}" cy="${n1(py)}" r="${n1(12 * u)}" fill="${c.accent}"/><circle cx="${n1(cx)}" cy="${n1(py)}" r="${n1(5 * u)}" fill="${c.card}"/>`;
  }],
  ['springtop', '스프링 프레임', (k) => {
    const { u, w, h, x0, y0, cw, ch, c } = k;
    const ox = x0 * 0.4, oy = y0 * 0.4;
    const n = 8, span = w - ox * 2 - 160 * u;
    let bars = '';
    for (let i = 0; i < n; i++) {
      const x = ox + 80 * u + (span * i) / (n - 1);
      bars += rect(x - 8 * u, oy - 22 * u, 16 * u, 66 * u, c.sub, 8 * u, ` stroke="${c.card}" stroke-width="${n1(4 * u)}"`);
    }
    return rect(ox, oy, w - ox * 2, h - oy * 2, c.accent, 48 * u) + rect(x0, y0 + 20 * u, cw, ch - 20 * u, c.card, 28 * u) + bars;
  }],
  ['double', '이중 라인 + 하단 띠', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    return rect(x0, y0, cw, ch, c.card, 16 * u) + clip('cd', x0, y0, cw, ch, 16 * u)
      + `<g clip-path="url(#cd)">${rect(x0, y0 + ch * 0.86, cw, ch * 0.14, c.accent)}</g>`
      + rect(x0 + 26 * u, y0 + 26 * u, cw - 52 * u, ch * 0.86 - 52 * u, 'none', 0, ` stroke="${c.accent}" stroke-width="${n1(4 * u)}"`);
  }],
  ['ruled', '줄 노트', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    let lines = '';
    for (let y = y0 + 120 * u; y < y0 + ch - 50 * u; y += 56 * u) lines += line(x0 + 40 * u, y, x0 + cw - 40 * u, y, c.sub, 3 * u, ' opacity=".7"');
    return shadow(k, 22 * u) + rect(x0, y0, cw, ch, c.card, 22 * u) + lines + line(x0 + 100 * u, y0 + 24 * u, x0 + 100 * u, y0 + ch - 24 * u, c.accent, 4 * u, ' opacity=".6"');
  }],
  ['grid', '모눈 노트', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const s = 50 * u;
    const def = `<defs><pattern id="gp" x="${n1(x0)}" y="${n1(y0)}" width="${n1(s)}" height="${n1(s)}" patternUnits="userSpaceOnUse"><path d="M${n1(s)} 0H0V${n1(s)}" fill="none" stroke="${c.sub}" stroke-width="${n1(2.5 * u)}"/></pattern></defs>`;
    return shadow(k, 22 * u) + rect(x0, y0, cw, ch, c.card, 22 * u) + def + rect(x0, y0, cw, ch, 'url(#gp)', 22 * u)
      + rect(x0, y0, cw, ch, 'none', 22 * u, ` stroke="${c.accent}" stroke-width="${n1(6 * u)}"`);
  }],
  ['dots', '도트 노트', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    const s = 46 * u;
    const def = `<defs><pattern id="dp" x="${n1(x0)}" y="${n1(y0)}" width="${n1(s)}" height="${n1(s)}" patternUnits="userSpaceOnUse"><circle cx="${n1(s / 2)}" cy="${n1(s / 2)}" r="${n1(3.2 * u)}" fill="${c.accent}" opacity=".45"/></pattern></defs>`;
    return shadow(k, 28 * u) + rect(x0, y0, cw, ch, c.card, 28 * u) + def + rect(x0, y0, cw, ch, 'url(#dp)', 28 * u);
  }],
  ['tape', '테이프 메모지', (k) => {
    const { u, w, h, x0, y0, cw, ch, c } = k;
    const tape = (x: number, y: number, a: number) => rect(x - 65 * u, y - 22 * u, 130 * u, 44 * u, c.sub, 4 * u, ` opacity=".9" transform="rotate(${a} ${n1(x)} ${n1(y)})"`);
    return `<g transform="rotate(-2.5 ${n1(w / 2)} ${n1(h / 2)})">${shadow(k, 10 * u)}${rect(x0, y0, cw, ch, c.card, 10 * u)}${tape(x0 + 40 * u, y0 + 6 * u, -32)}${tape(x0 + cw - 40 * u, y0 + 6 * u, 32)}</g>`;
  }],
  ['plain', '미니멀 카드', (k) => {
    const { u, x0, y0, cw, ch, c } = k;
    return [28, 18, 9].map((d, i) => rect(x0 + (d / 3) * u, y0 + d * u, cw, ch, '#000000', 40 * u, ` opacity="${[0.05, 0.07, 0.1][i]}"`)).join('')
      + rect(x0, y0, cw, ch, c.card, 40 * u);
  }],
  ['frame', '라인 프레임', (k) => {
    const { u, w, h, c } = k;
    const p = 70 * u, q = 14 * u;
    return rect(0, 0, w, h, c.accent) + rect(p, p, w - 2 * p, h - 2 * p, 'none', 0, ` stroke="${c.card}" stroke-width="${n1(8 * u)}"`)
      + rect(p - q, p - q, 2 * q, 2 * q, c.card) + rect(w - p - q, p - q, 2 * q, 2 * q, c.card)
      + rect(p - q, h - p - q, 2 * q, 2 * q, c.card) + rect(w - p - q, h - p - q, 2 * q, 2 * q, c.card);
  }],
];

export function makeCardSvg(id: string, c: CardColors, w: number, h: number) {
  const s = CARD_STYLES.find((x) => x[0] === id) || CARD_STYLES[0];
  const u = Math.min(w, h) / 1000;
  const m = 85 * u;
  const k: CC = { w, h, u, x0: m, y0: m, cw: w - 2 * m, ch: h - 2 * m, c };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0, 0, w, h, c.bg)}${s[2](k)}</svg>`;
}

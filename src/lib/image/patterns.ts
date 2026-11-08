// 배경 패턴 SVG를 만드는 코드입니다. 패턴을 추가하려면 PATTERNS 목록에 한 줄을 넣으면 돼요.
function rngSeed(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type PC = { u: number; fg: string; bg: string; w: number; h: number; r: () => number };
const tile = (tw: number, th: number, inner: string, extra = '') =>
  `<defs><pattern id="p" width="${tw}" height="${th}" patternUnits="userSpaceOnUse"${extra}>${inner}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/>`;
const scatter = (c: PC, perUnit: number, make: (c: PC) => string) => {
  const n = Math.round(((c.w * c.h) / (c.u * c.u)) * perUnit);
  let o = '';
  for (let i = 0; i < n; i++) o += make(c);
  return o;
};

export const PATTERNS: [string, string, (c: PC) => string][] = [
  ['dots', '작은 점', ({ u, fg }) => tile(u, u, `<circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.14}" fill="${fg}"/>`)],
  ['bigdots', '큰 점', ({ u, fg }) => tile(u * 1.6, u * 1.6, `<circle cx="${u * 0.8}" cy="${u * 0.8}" r="${u * 0.4}" fill="${fg}"/>`)],
  ['polka', '물방울', ({ u, fg }) => tile(u * 1.5, u * 1.5, `<circle cx="${u * 0.375}" cy="${u * 0.375}" r="${u * 0.2}" fill="${fg}"/><circle cx="${u * 1.125}" cy="${u * 1.125}" r="${u * 0.2}" fill="${fg}"/>`)],
  ['hstripe', '가로줄', ({ u, fg }) => tile(u, u, `<rect width="${u}" height="${u * 0.45}" fill="${fg}"/>`)],
  ['vstripe', '세로줄', ({ u, fg }) => tile(u, u, `<rect width="${u * 0.45}" height="${u}" fill="${fg}"/>`)],
  ['diag', '대각선', ({ u, fg }) => tile(u, u, `<rect width="${u * 0.45}" height="${u}" fill="${fg}"/>`, ' patternTransform="rotate(45)"')],
  ['thin', '가는 대각선', ({ u, fg }) => tile(u * 0.5, u * 0.5, `<rect width="${u * 0.1}" height="${u * 0.5}" fill="${fg}"/>`, ' patternTransform="rotate(45)"')],
  ['grid', '격자', ({ u, fg }) => tile(u, u, `<path d="M${u} 0H0V${u}" fill="none" stroke="${fg}" stroke-width="${u * 0.06}"/>`)],
  ['graph', '모눈종이', ({ u, fg }) => tile(u * 4, u * 4, `<path d="M${u} 0V${u * 4}M${u * 2} 0V${u * 4}M${u * 3} 0V${u * 4}M0 ${u}H${u * 4}M0 ${u * 2}H${u * 4}M0 ${u * 3}H${u * 4}" fill="none" stroke="${fg}" stroke-width="${u * 0.03}" opacity=".5"/><path d="M0 0V${u * 4}M0 0H${u * 4}" fill="none" stroke="${fg}" stroke-width="${u * 0.09}"/>`)],
  ['checker', '체크무늬', ({ u, fg }) => tile(u * 2, u * 2, `<rect width="${u}" height="${u}" fill="${fg}"/><rect x="${u}" y="${u}" width="${u}" height="${u}" fill="${fg}"/>`)],
  ['plaid', '격자 천', ({ u, fg }) => tile(u * 4, u * 4, `<rect y="${u * 0.5}" width="${u * 4}" height="${u * 1.2}" fill="${fg}" opacity=".35"/><rect x="${u * 0.5}" width="${u * 1.2}" height="${u * 4}" fill="${fg}" opacity=".35"/><rect y="${u * 2.4}" width="${u * 4}" height="${u * 0.12}" fill="${fg}"/><rect x="${u * 2.4}" width="${u * 0.12}" height="${u * 4}" fill="${fg}"/>`)],
  ['gingham', '깅엄 체크', ({ u, fg }) => tile(u * 2, u * 2, `<rect width="${u * 2}" height="${u}" fill="${fg}" opacity=".35"/><rect width="${u}" height="${u * 2}" fill="${fg}" opacity=".35"/>`)],
  ['chevron', '쉐브론', ({ u, fg }) => tile(u * 2, u, `<path d="M0 ${u * 0.5}L${u} 0L${u * 2} ${u * 0.5}V${u * 0.9}L${u} ${u * 0.4}L0 ${u * 0.9}Z" fill="${fg}"/>`)],
  ['zigzag', '지그재그', ({ u, fg }) => tile(u, u * 0.8, `<path d="M0 ${u * 0.6}L${u * 0.5} ${u * 0.15}L${u} ${u * 0.6}" fill="none" stroke="${fg}" stroke-width="${u * 0.1}"/>`)],
  ['wave', '물결', ({ u, fg }) => tile(u * 2, u * 0.8, `<path d="M0 ${u * 0.4}Q${u * 0.5} 0 ${u} ${u * 0.4}T${u * 2} ${u * 0.4}" fill="none" stroke="${fg}" stroke-width="${u * 0.1}"/>`)],
  ['scale', '물고기 비늘', ({ u, fg }) => tile(u, u * 0.5, `<g fill="none" stroke="${fg}" stroke-width="${u * 0.06}"><circle cx="0" cy="0" r="${u * 0.5}"/><circle cx="${u}" cy="0" r="${u * 0.5}"/><circle cx="${u * 0.5}" cy="${u * 0.5}" r="${u * 0.5}"/><circle cx="0" cy="${u * 0.5}" r="${u * 0.5}"/><circle cx="${u}" cy="${u * 0.5}" r="${u * 0.5}"/></g>`)],
  ['tri', '삼각형', ({ u, fg }) => tile(u, u, `<polygon points="${u / 2},${u * 0.15} ${u * 0.85},${u * 0.85} ${u * 0.15},${u * 0.85}" fill="${fg}"/>`)],
  ['hex', '벌집', ({ u, fg }) => {
    const k = (u * 0.9) / 56;
    return tile(56 * k, 100 * k, `<g transform="scale(${k})" fill="none" stroke="${fg}" stroke-width="2"><path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"/><path d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34"/></g>`);
  }],
  ['diamond', '마름모', ({ u, fg }) => tile(u * 2, u * 2, `<polygon points="${u},${u * 0.15} ${u * 1.85},${u} ${u},${u * 1.85} ${u * 0.15},${u}" fill="${fg}"/>`)],
  ['plus', '플러스', ({ u, fg }) => tile(u, u, `<path d="M${u / 2} ${u * 0.25}V${u * 0.75}M${u * 0.25} ${u / 2}H${u * 0.75}" fill="none" stroke="${fg}" stroke-width="${u * 0.1}"/>`)],
  ['star', '별', ({ u, fg }) => {
    const c = u * 0.7, R = u * 0.35, r = u * 0.15;
    const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r : R; return `${c + rr * Math.cos(a)},${c + rr * Math.sin(a)}`; }).join(' ');
    return tile(u * 1.4, u * 1.4, `<polygon points="${pts}" fill="${fg}"/>`);
  }],
  ['ring', '동그라미', ({ u, fg }) => tile(u * 1.5, u * 1.5, `<g fill="none" stroke="${fg}" stroke-width="${u * 0.08}"><circle cx="${u * 0.75}" cy="${u * 0.75}" r="${u * 0.5}"/><circle cx="${u * 0.75}" cy="${u * 0.75}" r="${u * 0.25}"/></g>`)],
  ['arc', '무지개 호', ({ u, fg }) => tile(u * 1.4, u * 0.7, `<g fill="none" stroke="${fg}" stroke-width="${u * 0.08}"><path d="M0 ${u * 0.7}A${u * 0.7} ${u * 0.7} 0 0 1 ${u * 1.4} ${u * 0.7}"/><path d="M${u * 0.2} ${u * 0.7}A${u * 0.5} ${u * 0.5} 0 0 1 ${u * 1.2} ${u * 0.7}"/></g>`)],
  ['brick', '벽돌', ({ u, fg }) => tile(u * 2, u, `<path d="M0 0H${u * 2}M0 ${u / 2}H${u * 2}M0 0V${u / 2}M${u} 0V${u / 2}M${u / 2} ${u / 2}V${u}M${u * 1.5} ${u / 2}V${u}" fill="none" stroke="${fg}" stroke-width="${u * 0.06}"/>`)],
  ['camo', '위장 무늬', (c) => {
    // 서로 다른 색 톤의 얼룩을 듬성듬성 겹쳐서, 바탕색이 군데군데 보이게 합니다.
    const layers: [string, number][] = [[c.fg, 0.45], ['#000000', 0.35], [c.fg, 0.9]];
    return layers.map(([fill, op]) => scatter(c, 0.45, ({ u, w, h, r }) => {
      const x = (r() * w).toFixed(1), y = (r() * h).toFixed(1);
      return `<ellipse cx="${x}" cy="${y}" rx="${(u * (0.35 + r() * 0.9)).toFixed(1)}" ry="${(u * (0.2 + r() * 0.5)).toFixed(1)}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})" fill="${fill}" opacity="${op}"/>`;
    })).join('');
  }],
  ['speckle', '테라조', (c) => scatter(c, 5, ({ u, w, h, r }) =>
    `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(u * (0.04 + r() * 0.1)).toFixed(1)}" fill="${c.fg}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`)],
  ['confetti', '색종이', (c) => scatter(c, 2.5, ({ u, w, h, r }) => {
    const x = (r() * w).toFixed(1), y = (r() * h).toFixed(1);
    return `<rect x="${x}" y="${y}" width="${(u * (0.12 + r() * 0.2)).toFixed(1)}" height="${(u * (0.05 + r() * 0.07)).toFixed(1)}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})" fill="${c.fg}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  })],
  ['grad1', '대각 그라데이션', ({ fg, bg }) => `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${fg}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`],
  ['grad2', '원형 그라데이션', ({ fg, bg }) => `<defs><radialGradient id="g" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`],
  ['grad3', '위아래 그라데이션', ({ fg, bg }) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${fg}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`],
  ['tiles', '타일', ({ u, fg }) => tile(u * 1.2, u * 1.2, `<rect x="${u * 0.1}" y="${u * 0.1}" width="${u}" height="${u}" rx="${u * 0.12}" fill="${fg}" opacity=".55"/>`)],
  ['pin', '핀스트라이프', ({ u, fg }) => tile(u * 0.8, u, `<rect width="${u * 0.04}" height="${u}" fill="${fg}"/>`)],
  ['dash', '점선', ({ u, fg }) => tile(u, u * 0.6, `<line x1="0" y1="${u * 0.3}" x2="${u}" y2="${u * 0.3}" stroke="${fg}" stroke-width="${u * 0.08}" stroke-dasharray="${u * 0.25} ${u * 0.2}"/>`)],
  ['lattice', '사선 격자', ({ u, fg }) => tile(u, u, `<path d="M0 0L${u} ${u}M${u} 0L0 ${u}" fill="none" stroke="${fg}" stroke-width="${u * 0.06}"/>`)],
  ['conc', '동심원', ({ u, fg, w, h }) => {
    const n = Math.ceil(Math.hypot(w, h) / 2 / (u * 0.6));
    let o = '';
    for (let i = 1; i <= n; i++) o += `<circle cx="${w / 2}" cy="${h / 2}" r="${i * u * 0.6}" fill="none" stroke="${fg}" stroke-width="${u * 0.06}" opacity=".7"/>`;
    return o;
  }],
];

// bg 는 "#rrggbb" 또는 "grad:#색1:#색2:각도" 형식입니다.
function gradDef(c1: string, c2: string, ang: number, w: number, h: number) {
  const a = (ang * Math.PI) / 180;
  const L = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
  const cx = w / 2, cy = h / 2;
  const dx = (Math.sin(a) * L) / 2, dy = (Math.cos(a) * L) / 2;
  return `<defs><linearGradient id="bgg" gradientUnits="userSpaceOnUse" x1="${(cx - dx).toFixed(1)}" y1="${(cy + dy).toFixed(1)}" x2="${(cx + dx).toFixed(1)}" y2="${(cy - dy).toFixed(1)}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bgg)"/>`;
}
export function makeSvg(id: string, bg: string, fg: string, w: number, h: number, scale = 1, uBase = (56 * Math.max(w, h)) / 1000, alpha = 1) {
  const p = PATTERNS.find((x) => x[0] === id) || PATTERNS[0];
  const g = bg.startsWith('grad:') ? bg.split(':') : null;
  const c1 = g ? g[1] : bg;
  const base = g ? gradDef(g[1], g[2], Number(g[3]) || 0, w, h) : `<rect width="100%" height="100%" fill="${bg}"/>`;
  const body = p[2]({ u: uBase * scale, fg, bg: c1, w, h, r: rngSeed(PATTERNS.indexOf(p) * 977 + 13) });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${base}${alpha < 1 ? `<g opacity="${alpha}">${body}</g>` : body}</svg>`;
}

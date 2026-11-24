// 글씨 넣기 설정(상·중·하 글씨, 반복 워터마크, 아이콘 배경)을 텍스트로 내보내고 다시 읽어 들이는 코드입니다.
// 이미지(로고) 파일은 텍스트로 담을 수 없어서 제외됩니다.
import { FONTS } from './render';
import type { Sec, Wm, Bgi } from './render';

type Range = (sid: string, key: string) => [number, number] | null;
export type PresetResult = { ok: boolean; count: number; error?: string };

const HEX = /^#[0-9a-fA-F]{6}$/;
const COLOR_KEYS = new Set(['color', 'accent', 'hl', 'strokeColor', 'shadowColor', 'boxColor', 'iconColor']);
const ENUMS: Record<string, string[]> = {
  align: ['left', 'center', 'right'],
  box: ['none', 'box', 'band'],
  imgPos: ['left', 'top', 'bottom'],
  layout: ['grid', 'stagger'],
};
// 굵기 선택지에 있는 값으로만 받습니다. (sec=상중하, w=워터마크, b=아이콘 배경)
const WEIGHTS: Record<string, number[]> = { sec: [400, 500, 700, 900], w: [400, 500, 700, 900], b: [300, 400, 700] };
const nearest = (v: number, list: number[]) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));

// 현재 설정(target)의 항목 이름과 자료형을 기준으로, 맞는 값만 골라서 덮어씁니다.
function applyPart(target: any, src: any, sid: string, wkey: string, range: Range): number {
  if (!src || typeof src !== 'object') return 0;
  let n = 0;
  for (const k of Object.keys(target)) {
    if (k === 'img' || !(k in src)) continue;
    const cur = target[k];
    const v = src[k];
    if (typeof cur === 'boolean' && typeof v === 'boolean') {
      target[k] = v; n++;
    } else if (typeof cur === 'number' && typeof v === 'number' && Number.isFinite(v)) {
      let x = v;
      if (k === 'weight') x = nearest(v, WEIGHTS[wkey]);
      else {
        const r = range(sid, k);
        if (r) x = Math.min(r[1], Math.max(r[0], v));
      }
      target[k] = x; n++;
    } else if (typeof cur === 'string' && typeof v === 'string') {
      if (COLOR_KEYS.has(k)) { if (HEX.test(v)) { target[k] = v.toLowerCase(); n++; } }
      else if (k === 'font') { if (FONTS.some((f) => f.id === v)) { target[k] = v; n++; } }
      else if (ENUMS[k]) { if (ENUMS[k].includes(v)) { target[k] = v; n++; } }
      else { target[k] = v.slice(0, 2000); n++; }
    }
  }
  return n;
}

export function toPresetText(secs: Sec[], wm: Wm, bgi: Bgi, order?: number[]): string {
  const strip = (o: object) => { const c: any = { ...o }; delete c.img; return c; };
  return JSON.stringify({ v: 1, sections: secs.map(strip), watermark: { ...wm }, iconBg: { ...bgi }, ...(order ? { layers: [...order] } : {}) });
}

export function applyPreset(text: string, secs: Sec[], wm: Wm, bgi: Bgi, range: Range, order?: number[]): PresetResult {
  let data: any;
  try { data = JSON.parse(text.trim()); }
  catch { return { ok: false, count: 0, error: '프리셋을 읽지 못했어요. 복사한 내용이 처음부터 끝까지 다 들어갔는지 확인해 주세요.' }; }
  if (!data || typeof data !== 'object' || !(Array.isArray(data.sections) || data.watermark || data.iconBg)) {
    return { ok: false, count: 0, error: '이 텍스트에는 적용할 설정이 없어요. "현재 설정 보기"로 만든 프리셋을 붙여넣어 주세요.' };
  }
  let count = 0;
  if (Array.isArray(data.sections)) data.sections.slice(0, secs.length).forEach((p: any, i: number) => { count += applyPart(secs[i], p, String(i), 'sec', range); });
  // 레이어 순서: 0~(개수-1)이 한 번씩 들어 있을 때만 받습니다. (예전 프리셋에는 없어서 그대로 둬요)
  if (order && Array.isArray(data.layers) && data.layers.length === order.length
    && [...data.layers].sort((a: number, b: number) => a - b).every((v: number, i: number) => v === i)) {
    order.splice(0, order.length, ...data.layers.map(Number)); count++;
  }
  count += applyPart(wm, data.watermark, 'w', 'w', range);
  count += applyPart(bgi, data.iconBg, 'b', 'b', range);
  return count ? { ok: true, count } : { ok: false, count: 0, error: '적용할 수 있는 설정을 찾지 못했어요.' };
}

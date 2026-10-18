export type Action = { id: string; label: string; fn: (s: string) => string };

const words = (t: string) => t.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const perLine = (f: (l: string) => string) => (s: string) => s.split(/\r?\n/).map(f).join('\n');
const sortKeys = (v: any): any =>
  Array.isArray(v) ? v.map(sortKeys)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
  : v;
const parseJson = (s: string) => {
  try { return JSON.parse(s); } catch (e) { throw new Error('JSON 문법 오류: ' + (e as Error).message); }
};

export const TRANSFORMS: Record<string, { actions: Action[] }> = {
  'line-break': {
    actions: [
      { id: 'to-space', label: '줄바꿈을 공백으로', fn: (s) => s.replace(/\s*(\r?\n|\r)\s*/g, ' ').trim() },
      { id: 'remove', label: '줄바꿈 완전 제거', fn: (s) => s.replace(/\r?\n|\r/g, '') },
      { id: 'blank', label: '빈 줄 제거', fn: (s) => s.split(/\r?\n/).filter((l) => l.trim()).join('\n') },
      { id: 'collapse', label: '연속 공백 하나로', fn: (s) => s.replace(/[^\S\r\n]+/g, ' ').replace(/^ | $/gm, '') },
      { id: 'nospace', label: '공백 전체 제거', fn: (s) => s.replace(/\s/g, '') },
    ],
  },
  case: {
    actions: [
      { id: 'upper', label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
      { id: 'lower', label: 'lowercase', fn: (s) => s.toLowerCase() },
      { id: 'title', label: 'Title Case', fn: (s) => s.toLowerCase().replace(/(^|[\s\-_(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()) },
      { id: 'sentence', label: 'Sentence case', fn: (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, a, b) => a + b.toUpperCase()) },
      { id: 'snake', label: 'snake_case', fn: perLine((l) => words(l).map((w) => w.toLowerCase()).join('_')) },
      { id: 'kebab', label: 'kebab-case', fn: perLine((l) => words(l).map((w) => w.toLowerCase()).join('-')) },
      { id: 'camel', label: 'camelCase', fn: perLine((l) => words(l).map((w, i) => { w = w.toLowerCase(); return i ? w[0].toUpperCase() + w.slice(1) : w; }).join('')) },
    ],
  },
  json: {
    actions: [
      { id: 'pretty', label: '정렬하기', fn: (s) => JSON.stringify(parseJson(s), null, 2) },
      { id: 'minify', label: '한 줄로 축소', fn: (s) => JSON.stringify(parseJson(s)) },
      { id: 'sort', label: '키 이름순 정렬', fn: (s) => JSON.stringify(sortKeys(parseJson(s)), null, 2) },
    ],
  },
  base64: {
    actions: [
      {
        id: 'enc', label: '인코딩',
        fn: (s) => { let bin = ''; new TextEncoder().encode(s).forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin); },
      },
      {
        id: 'dec', label: '디코딩',
        fn: (s) => {
          try {
            const bin = atob(s.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/'));
            return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
          } catch { throw new Error('올바른 Base64 문자열이 아닙니다.'); }
        },
      },
    ],
  },
  'url-encode': {
    actions: [
      { id: 'enc', label: 'URL 인코딩', fn: (s) => encodeURIComponent(s) },
      { id: 'enc-full', label: '주소 전체 인코딩', fn: (s) => encodeURI(s) },
      {
        id: 'dec', label: 'URL 디코딩',
        fn: (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { throw new Error('올바르게 인코딩된 문자열이 아닙니다.'); } },
      },
    ],
  },
};

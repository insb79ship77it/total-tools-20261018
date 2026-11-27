// 이미지 글씨 프리셋을 로그인 아이디별로 저장합니다. (Cloudflare KV, 바인딩 이름: PRESETS)
//   GET    /api/presets                  -> { presets, pinned, max }  (내 프리셋 + 고정 프리셋)
//   POST   /api/presets                  -> { name, data, kind? } 저장. kind: 'pin' 이면 고정 프리셋
//   DELETE /api/presets?id=...&kind=pin  -> 하나 삭제 (kind 생략하면 일반 프리셋)
// 일반 프리셋은 10개를 넘으면 가장 오래된 것이 지워지고, 고정 프리셋은 10개가 차면 저장이 막힙니다(직접 삭제해야 해요).
import { userOf } from '../_lib/auth.js';

const MAX = 10;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function readList(env, key) {
  try {
    const a = JSON.parse((await env.PRESETS.get(key)) || '[]');
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export async function onRequest({ request, env }) {
  if (!env.AUTH_SECRET) return json({ error: '로그인 설정이 아직 없어요.' }, 503);
  const user = await userOf(request.headers.get('cookie'), env.AUTH_SECRET);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401);
  if (!env.PRESETS) return json({ error: '프리셋 저장소(KV)가 아직 연결되지 않았어요. 바인딩 이름을 PRESETS로 연결해 주세요.' }, 503);

  const KEY = { ps: `presets:${user}`, pin: `pinned:${user}` };
  const both = async () => ({ presets: await readList(env, KEY.ps), pinned: await readList(env, KEY.pin), max: MAX });

  if (request.method === 'GET') return json(await both());

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: '잘못된 요청입니다.' }, 400); }
    const kind = body.kind === 'pin' ? 'pin' : 'ps';
    const name = String(body.name || '').trim().slice(0, 40) || '프리셋';
    const data = typeof body.data === 'string' ? body.data : '';
    if (!data || data.length > 20000) return json({ error: '프리셋 내용이 비었거나 너무 커요.' }, 400);
    try { if (!JSON.parse(data) || typeof JSON.parse(data) !== 'object') throw 0; } catch { return json({ error: '프리셋 형식이 올바르지 않아요.' }, 400); }
    const list = await readList(env, KEY[kind]);
    if (kind === 'pin' && list.length >= MAX) return json({ error: `고정 프리셋은 ${MAX}개까지예요. 하나를 삭제한 뒤 저장해 주세요.` }, 400);
    // 같은 이름도 따로 저장합니다. (id로 구분)
    const item = { id: crypto.randomUUID(), name, savedAt: new Date().toISOString(), data };
    await env.PRESETS.put(KEY[kind], JSON.stringify([item, ...list].slice(0, MAX)));
    return json(await both());
  }

  if (request.method === 'DELETE') {
    const u = new URL(request.url);
    const id = u.searchParams.get('id');
    const kind = u.searchParams.get('kind') === 'pin' ? 'pin' : 'ps';
    const list = await readList(env, KEY[kind]);
    await env.PRESETS.put(KEY[kind], JSON.stringify(list.filter((p) => p.id !== id)));
    return json(await both());
  }
  return json({ error: '지원하지 않는 요청입니다.' }, 405);
}

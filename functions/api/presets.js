// 이미지 글씨 프리셋을 로그인 아이디별로 저장합니다. (Cloudflare KV, 바인딩 이름: PRESETS)
//   GET    /api/presets            -> 내 프리셋 목록
//   POST   /api/presets            -> { name, data } 저장 (같은 이름은 덮어쓰고, 10개를 넘으면 가장 오래된 것이 지워져요)
//   DELETE /api/presets?id=...     -> 하나 삭제
import { userOf } from '../_lib/auth.js';

const MAX = 10;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function readList(env, user) {
  try {
    const a = JSON.parse((await env.PRESETS.get(`presets:${user}`)) || '[]');
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

  let list = await readList(env, user);
  if (request.method === 'GET') return json({ presets: list, max: MAX });

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: '잘못된 요청입니다.' }, 400); }
    const name = String(body.name || '').trim().slice(0, 40) || '프리셋';
    const data = typeof body.data === 'string' ? body.data : '';
    if (!data || data.length > 20000) return json({ error: '프리셋 내용이 비었거나 너무 커요.' }, 400);
    try { if (!JSON.parse(data) || typeof JSON.parse(data) !== 'object') throw 0; } catch { return json({ error: '프리셋 형식이 올바르지 않아요.' }, 400); }
    const item = { id: crypto.randomUUID(), name, savedAt: new Date().toISOString(), data };
    list = [item, ...list.filter((p) => p.name !== name)].slice(0, MAX);
    await env.PRESETS.put(`presets:${user}`, JSON.stringify(list));
    return json({ presets: list, max: MAX });
  }

  if (request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id');
    list = list.filter((p) => p.id !== id);
    await env.PRESETS.put(`presets:${user}`, JSON.stringify(list));
    return json({ presets: list, max: MAX });
  }
  return json({ error: '지원하지 않는 요청입니다.' }, 405);
}

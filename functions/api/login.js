// POST /api/login  (아이디, 암호, next)
import { sign, parseUsers, safeEqual } from '../_lib/auth.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function onRequestPost({ request, env }) {
  if (!env.AUTH_SECRET || !env.AUTH_USERS) {
    return new Response('로그인 설정이 아직 없어요. (AUTH_SECRET, AUTH_USERS)', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const form = await request.formData();
  const id = String(form.get('id') || '').trim();
  const pw = String(form.get('pw') || '');
  let next = String(form.get('next') || '/tools/naver-check/');
  if (!next.startsWith('/') || next.startsWith('//')) next = '/tools/naver-check/'; // 다른 사이트로 보내지 않습니다

  let ok = false;
  for (const [u, p] of parseUsers(env.AUTH_USERS)) {
    const a = safeEqual(u, id);
    const b = safeEqual(p, pw);
    if (a && b) ok = true;
  }

  if (!ok) {
    await sleep(800); // 암호를 연달아 넣어보는 시도를 늦춥니다
    return new Response(null, { status: 303, headers: { location: `/login/?error=1&next=${encodeURIComponent(next)}`, 'cache-control': 'no-store' } });
  }

  const token = await sign(id, env.AUTH_SECRET, 7);
  return new Response(null, {
    status: 303,
    headers: {
      location: next,
      'set-cookie': `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 86400}`,
      'cache-control': 'no-store',
    },
  });
}

// 로그인한 사람만 볼 수 있는 경로를 지킵니다.
// 보호할 경로를 바꾸려면 아래 PROTECTED와 public/_routes.json을 함께 고치세요.
import { verify } from './_lib/auth.js';

// 블로그 누락 체크 페이지와, 그 페이지가 쓰는 API를 함께 지킵니다.
const PROTECTED = ['/tools/naver-check', '/api/naver-posts', '/api/naver-check'];

const text = (msg, status) =>
  new Response(msg, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!PROTECTED.some((p) => path === p || path.startsWith(p + '/'))) return next();

  // 설정이 없으면 열어두지 않고 막습니다.
  if (!env.AUTH_SECRET || !env.AUTH_USERS) return text('로그인 설정이 아직 없어요. (AUTH_SECRET, AUTH_USERS)', 503);

  if (!(await verify(request.headers.get('cookie'), env.AUTH_SECRET))) {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), {
        status: 401,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    const to = `/login/?next=${encodeURIComponent(path + url.search)}`;
    return new Response(null, { status: 302, headers: { location: to, 'cache-control': 'no-store' } });
  }

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('cache-control', 'private, no-store');
  return out;
}

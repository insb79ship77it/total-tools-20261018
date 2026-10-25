// GET /api/logout  -> 로그인 쿠키를 지우고 로그인 화면으로 보냅니다.
export async function onRequest() {
  return new Response(null, {
    status: 303,
    headers: {
      location: '/login/',
      'set-cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'cache-control': 'no-store',
    },
  });
}

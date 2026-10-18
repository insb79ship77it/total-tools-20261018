// GET /api/naver-check?blogId=xxx&logNo=123&title=글제목
// 같은 제목을 "통합검색"과 "블로그탭"에서 각각 검색해,
// 해당 글(logNo)로 가는 링크가 결과 HTML에 있는지, 있다면 텍스트(제목) 링크인지 이미지(썸네일) 링크인지 판별합니다.
// 반환값: { main, blog } — 각각 'text' | 'image' | 'none' | 'error'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function inspect(url, blogId, logNo) {
  let html;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ko-KR,ko;q=0.9' } });
    if (!res.ok) return 'error';
    html = await res.text();
  } catch {
    return 'error';
  }
  if (html.length < 5000) return 'error'; // 차단/캡차 등 비정상 응답

  const id = blogId.toLowerCase();
  let hasText = false;
  let hasImage = false;

  // 클래스명은 자주 바뀌므로 쓰지 않고, "이 글로 가는 링크(<a>)"를 찾아 안쪽 내용만 봅니다.
  for (const m of html.matchAll(/<a\b[^>]*?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1].replace(/&amp;/g, '&').toLowerCase();
    if (!href.includes(logNo) || !href.includes(id)) continue;
    const inner = m[2];
    const text = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (text) hasText = true;
    else if (/<img\b/i.test(inner)) hasImage = true;
  }
  return hasText ? 'text' : hasImage ? 'image' : 'none';
}

export async function onRequestGet({ request }) {
  const p = new URL(request.url).searchParams;
  const blogId = (p.get('blogId') || '').trim();
  const logNo = (p.get('logNo') || '').trim();
  const title = (p.get('title') || '').trim();

  if (!/^[A-Za-z0-9_-]{2,30}$/.test(blogId) || !/^\d{6,}$/.test(logNo) || !title) {
    return json({ error: '잘못된 요청입니다.' }, 400);
  }

  const q = encodeURIComponent(`"${title}"`);
  const [main, blog] = await Promise.all([
    inspect(`https://search.naver.com/search.naver?where=nexearch&query=${q}`, blogId, logNo),
    inspect(`https://search.naver.com/search.naver?ssc=tab.blog.all&query=${q}`, blogId, logNo),
  ]);
  return json({ main, blog });
}

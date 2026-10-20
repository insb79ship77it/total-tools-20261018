// GET /api/naver-check?blogId=xxx&logNo=123&title=글제목
// 같은 제목을 "통합검색"과 "블로그탭"에서 각각 검색해,
// 해당 글(logNo)로 가는 링크가 결과 HTML에 있는지, 있다면 텍스트(제목) 링크인지 이미지(썸네일) 링크인지 판별합니다.
// 반환값: { main, blog, mainNote, blogNote } — main/blog는 'text' | 'image' | 'none' | 'error'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

// 무료 플랜은 요청당 CPU 시간이 짧아서, 큰 HTML 전체에 정규식을 돌리지 않고
// "글 번호가 나오는 위치" 근처만 문자열 검색으로 확인합니다.
function scan(html, blogId, logNo) {
  const id = blogId.toLowerCase();
  let hasText = false;
  let hasImage = false;
  let from = 0;
  let lastStart = -1;
  let i;
  while ((i = html.indexOf(logNo, from)) !== -1) {
    from = i + logNo.length;
    const start = html.lastIndexOf('<a ', i);
    if (start < 0 || start === lastStart || i - start > 800) continue;
    const tagEnd = html.indexOf('>', start);
    if (tagEnd < i) continue; // 글 번호가 여는 태그(href) 안에 있어야 합니다
    const open = html.slice(start, tagEnd + 1);
    if (!/href=/i.test(open) || !open.toLowerCase().includes(id)) continue;
    lastStart = start;
    const close = html.indexOf('</a>', tagEnd);
    if (close < 0) continue;
    const inner = html.slice(tagEnd + 1, close);
    const text = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (text) { hasText = true; break; }
    if (/<img\b/i.test(inner)) hasImage = true;
  }
  return hasText ? 'text' : hasImage ? 'image' : 'none';
}

async function inspect(url, blogId, logNo) {
  let res, html;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.5',
        Referer: 'https://www.naver.com/',
      },
      signal: AbortSignal.timeout(8000),
    });
    html = await res.text();
  } catch {
    return { hit: 'error', note: '네이버에 연결하지 못했어요' };
  }
  if (!res.ok) return { hit: 'error', note: `네이버가 요청을 거부했어요 (HTTP ${res.status})` };
  if (html.length < 5000) return { hit: 'error', note: `응답이 비정상적으로 짧아요 (${html.length}자). 차단이나 캡차일 수 있어요` };
  return { hit: scan(html, blogId, logNo), note: '' };
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
  // 네이버에 한꺼번에 몰리지 않도록 두 요청을 차례로 보냅니다.
  const m = await inspect(`https://search.naver.com/search.naver?where=nexearch&query=${q}`, blogId, logNo);
  await new Promise((r) => setTimeout(r, 400));
  const b = await inspect(`https://search.naver.com/search.naver?ssc=tab.blog.all&query=${q}`, blogId, logNo);
  return json({ main: m.hit, blog: b.hit, mainNote: m.note, blogNote: b.note });
}

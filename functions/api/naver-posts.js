// GET /api/naver-posts?blogId=xxx
// 네이버 블로그 RSS에서 최근 글 목록(제목·링크·발행일)을 가져옵니다.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');

const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`));
  return m ? decode(m[1].trim()) : '';
};

export async function onRequestGet({ request }) {
  const blogId = (new URL(request.url).searchParams.get('blogId') || '').trim();
  if (!/^[A-Za-z0-9_-]{2,30}$/.test(blogId)) {
    return json({ error: '올바른 네이버 블로그 아이디를 입력하세요.' }, 400);
  }

  let res;
  try {
    res = await fetch(`https://rss.blog.naver.com/${blogId}.xml`, { headers: { 'User-Agent': UA } });
  } catch {
    return json({ error: '네이버 RSS에 연결하지 못했습니다.' }, 502);
  }
  if (!res.ok) return json({ error: '블로그를 찾을 수 없습니다. 아이디를 확인하세요.' }, 404);

  const xml = await res.text();
  const [head, ...chunks] = xml.split('<item>');
  const posts = chunks
    .map((c) => {
      const link = pick(c, 'link');
      const m = link.match(/blog\.naver\.com\/[^/?]+\/(\d+)/);
      return { title: pick(c, 'title'), logNo: m ? m[1] : '', pubDate: pick(c, 'pubDate') };
    })
    .filter((p) => p.title && p.logNo);

  return json({ blogTitle: pick(head, 'title') || blogId, posts });
}

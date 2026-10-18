// GET /api/whois?domain=example.com
// RDAP(WHOIS의 후속 표준)로 도메인 등록 정보를 조회합니다.

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ request }) {
  let d = (new URL(request.url).searchParams.get('domain') || '').trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  try {
    d = new URL('http://' + d).hostname; // 한글 도메인은 punycode로 변환
  } catch {
    return json({ error: '올바른 도메인을 입력하세요.' }, 400);
  }
  if (!/^(?=.{4,253}$)([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63}$/.test(d)) {
    return json({ error: '올바른 도메인을 입력하세요. (예: example.com)' }, 400);
  }

  let res;
  try {
    res = await fetch(`https://rdap.org/domain/${d}`, { headers: { accept: 'application/rdap+json' }, redirect: 'follow' });
  } catch {
    return json({ error: '도메인 정보 서버에 연결하지 못했습니다.' }, 502);
  }
  if (res.status === 404) {
    return json({ error: '등록 정보를 찾지 못했습니다. 등록되지 않은 도메인이거나, 이 확장자는 조회를 지원하지 않을 수 있어요. 하위 도메인이라면 최상위 도메인(example.com)으로 조회해 보세요.' }, 404);
  }
  if (res.status === 429) return json({ error: '조회 요청이 많아 잠시 제한됐습니다. 잠시 후 다시 시도하세요.' }, 429);
  if (!res.ok) return json({ error: '도메인 정보를 가져오지 못했습니다.' }, 502);

  let j;
  try { j = await res.json(); } catch { return json({ error: '도메인 정보를 해석하지 못했습니다.' }, 502); }

  const event = (a) => j.events?.find((e) => e.eventAction === a)?.eventDate || '';
  const registrarEntity = j.entities?.find((e) => e.roles?.includes('registrar'));
  const registrar = registrarEntity?.vcardArray?.[1]?.find((x) => x[0] === 'fn')?.[3] || '';

  return json({
    domain: j.ldhName || d,
    registrar,
    created: event('registration'),
    expires: event('expiration'),
    updated: event('last changed'),
    nameservers: (j.nameservers || []).map((n) => (n.ldhName || '').toLowerCase()).filter(Boolean),
    status: j.status || [],
    dnssec: j.secureDNS ? !!j.secureDNS.delegationSigned : null,
  });
}

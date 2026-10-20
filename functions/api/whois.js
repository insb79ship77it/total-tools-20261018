// GET /api/whois?domain=example.com
// RDAP(WHOIS의 후속 표준)로 도메인 등록 정보를 조회합니다.
// 확장자별 공식 RDAP 서버에 직접 물어보고, 안 되면 rdap.org로 한 번 더 시도합니다.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

// 자주 쓰는 확장자의 RDAP 서버 (그 외 확장자는 IANA 목록에서 찾습니다)
const KNOWN = {
  com: 'https://rdap.verisign.com/com/v1/',
  net: 'https://rdap.verisign.com/net/v1/',
  org: 'https://rdap.publicinterestregistry.org/rdap/',
  info: 'https://rdap.identitydigital.services/rdap/',
  io: 'https://rdap.identitydigital.services/rdap/',
};

async function bootstrap(tld) {
  try {
    const res = await fetch('https://data.iana.org/rdap/dns.json', {
      signal: AbortSignal.timeout(5000),
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    const j = await res.json();
    for (const [tlds, urls] of j.services || []) {
      if (tlds.includes(tld)) return urls.find((u) => u.startsWith('https')) || urls[0];
    }
  } catch {
    // 찾지 못하면 rdap.org로 넘어갑니다.
  }
  return null;
}

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

  const tld = d.split('.').pop();
  const bases = [];
  const direct = KNOWN[tld] || (await bootstrap(tld));
  if (direct) bases.push(direct);
  bases.push('https://rdap.org/');

  let j = null;
  let lastStatus = 0;
  for (const base of bases) {
    let res;
    try {
      res = await fetch(`${base.endsWith('/') ? base : base + '/'}domain/${d}`, {
        headers: { accept: 'application/rdap+json, application/json', 'user-agent': UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      continue;
    }
    if (res.status === 404) {
      return json({ error: '등록 정보를 찾지 못했습니다. 등록되지 않은 도메인이거나, 이 확장자는 조회를 지원하지 않을 수 있어요. 하위 도메인이라면 최상위 도메인(example.com)으로 조회해 보세요.' }, 404);
    }
    if (res.ok) {
      try { j = await res.json(); break; } catch { continue; }
    }
    lastStatus = res.status;
  }

  if (!j) {
    return json({ error: `도메인 정보를 가져오지 못했습니다${lastStatus ? ` (HTTP ${lastStatus})` : ''}. 잠시 후 다시 시도하세요.` }, 502);
  }

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

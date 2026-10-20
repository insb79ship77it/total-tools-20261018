// GET /api/ip            -> 접속자 본인의 IP와 위치 (Cloudflare가 제공하는 정보)
// GET /api/ip?ip=1.2.3.4 -> 입력한 IP의 위치. 여러 조회 서비스를 차례로 시도합니다.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const isIPv4 = (s) => /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every((n) => Number(n) <= 255);
const isIPv6 = (s) => /^[0-9a-fA-F:]+$/.test(s) && (s.match(/:/g) || []).length >= 2;
const isPrivate = (s) =>
  /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(s) || /^(::1?$|f[cd][0-9a-f]{2}:|fe80:)/i.test(s);

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error('http ' + res.status);
  return res.json();
}

const providers = [
  async (ip) => {
    const d = await getJson(`https://ipwho.is/${ip}`);
    if (!d.success) throw new Error(d.message || 'fail');
    return {
      ip: d.ip, countryCode: d.country_code, region: d.region, city: d.city,
      org: d.connection?.org || d.connection?.isp, asn: d.connection?.asn ? `AS${d.connection.asn}` : '',
      timezone: d.timezone?.id, lat: d.latitude, lon: d.longitude,
    };
  },
  async (ip) => {
    const d = await getJson(`https://ipinfo.io/${ip}/json`);
    if (d.bogon || !d.ip) throw new Error('fail');
    const [lat, lon] = (d.loc || '').split(',').map(Number);
    const m = (d.org || '').match(/^(AS\d+)\s*(.*)$/);
    return {
      ip: d.ip, countryCode: d.country, region: d.region, city: d.city,
      org: m ? m[2] : d.org, asn: m ? m[1] : '', timezone: d.timezone,
      lat: Number.isNaN(lat) ? null : lat, lon: Number.isNaN(lon) ? null : lon,
    };
  },
  async (ip) => {
    // 무료 플랜은 비상업용·HTTP 전용이라 마지막 수단으로만 사용합니다.
    const d = await getJson(`http://ip-api.com/json/${ip}?fields=status,message,countryCode,regionName,city,lat,lon,timezone,isp,org,as,query`);
    if (d.status !== 'success') throw new Error(d.message || 'fail');
    const m = (d.as || '').match(/^(AS\d+)/);
    return {
      ip: d.query, countryCode: d.countryCode, region: d.regionName, city: d.city,
      org: d.org || d.isp, asn: m ? m[1] : '', timezone: d.timezone, lat: d.lat, lon: d.lon,
    };
  },
];

export async function onRequestGet({ request }) {
  const q = (new URL(request.url).searchParams.get('ip') || '').trim();

  if (!q) {
    const cf = request.cf || {};
    return json({
      ip: request.headers.get('CF-Connecting-IP') || '',
      countryCode: cf.country || '',
      region: cf.region || '',
      city: cf.city || '',
      org: cf.asOrganization || '',
      asn: cf.asn ? `AS${cf.asn}` : '',
      timezone: cf.timezone || '',
      lat: cf.latitude ? Number(cf.latitude) : null,
      lon: cf.longitude ? Number(cf.longitude) : null,
    });
  }

  if (!isIPv4(q) && !isIPv6(q)) return json({ error: '올바른 IP 주소 형식이 아닙니다. (예: 8.8.8.8)' }, 400);
  if (isPrivate(q)) return json({ error: '사설·내부 IP 주소는 위치를 조회할 수 없습니다.' }, 400);

  for (const provider of providers) {
    try {
      const d = await provider(q);
      if (d && d.ip) return json(d);
    } catch {
      // 다음 서비스로 넘어갑니다.
    }
  }
  return json({ error: 'IP 정보를 가져오지 못했습니다. 잠시 후 다시 시도하세요.' }, 502);
}

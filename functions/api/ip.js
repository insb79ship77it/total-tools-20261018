// GET /api/ip            -> 접속자 본인의 IP와 위치 (Cloudflare가 제공하는 정보)
// GET /api/ip?ip=1.2.3.4 -> 입력한 IP의 위치 (ipwho.is 사용)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

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

  if (!/^[0-9a-fA-F:.]{3,45}$/.test(q)) return json({ error: '올바른 IP 주소를 입력하세요.' }, 400);

  let d;
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(q)}`);
    d = await res.json();
  } catch {
    return json({ error: 'IP 조회 서비스에 연결하지 못했습니다.' }, 502);
  }
  if (!d.success) return json({ error: '조회할 수 없는 IP 주소입니다.' }, 404);

  return json({
    ip: d.ip,
    countryCode: d.country_code || '',
    region: d.region || '',
    city: d.city || '',
    org: d.connection?.org || d.connection?.isp || '',
    asn: d.connection?.asn ? `AS${d.connection.asn}` : '',
    timezone: d.timezone?.id || '',
    lat: d.latitude ?? null,
    lon: d.longitude ?? null,
  });
}

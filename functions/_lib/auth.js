// 로그인 쿠키를 만들고 검증하는 공용 도구입니다.
const enc = new TextEncoder();

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

// 길이가 같을 때 끝까지 비교해서, 비교 시간으로 값을 짐작하지 못하게 합니다.
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// AUTH_USERS = "아이디1:암호1,아이디2:암호2"
export function parseUsers(raw) {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf(':');
      return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : null;
    })
    .filter(Boolean);
}

export async function sign(user, secret, days = 7) {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const payload = `${b64url(enc.encode(user))}.${exp}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verify(cookieHeader, secret) {
  const m = /(?:^|;\s*)session=([^;]+)/.exec(cookieHeader || '');
  if (!m) return false;
  const parts = m[1].split('.');
  if (parts.length !== 3) return false;
  const [u, exp, sig] = parts;
  if (!(Number(exp) > Date.now() / 1000)) return false;
  return safeEqual(sig, await hmac(secret, `${u}.${exp}`));
}

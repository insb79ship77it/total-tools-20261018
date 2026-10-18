export const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]!);

export async function copy(text: string, btn?: HTMLElement) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  flash(btn);
}

export function flash(btn?: HTMLElement) {
  if (!btn) return;
  const old = btn.textContent;
  btn.textContent = '복사됨';
  setTimeout(() => (btn.textContent = old), 1200);
}

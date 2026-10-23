export const ICONS: Record<string, string> = {
  speed: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  ip: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  domain: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  blog: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1"/>',
  utm: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',
  char: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  linebreak: '<path d="M3 6h18M3 12h12a3 3 0 0 1 0 6h-4"/><path d="m13 15-3 3 3 3"/>',
  case: '<path d="M3 18l4.5-12L12 18M4.7 14h5.6"/><path d="M15 18v-6l3-1 3 1v6M15 15h6"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="16" r="1"/><circle cx="12" cy="12" r="1"/>',
  json: '<path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"/><path d="M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  url: '<path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  favicon: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9 16V8h5M9 12h4"/>',
};

export type Tool = {
  slug: string;
  name: string;
  short: string;
  desc: string;
  icon: string;
  group: string;
  primary?: boolean;
};

export const groups = ['네트워크', '블로그·마케팅', '텍스트', '개발·계산'];
export const groupKey: Record<string, string> = { '네트워크': 'net', '블로그·마케팅': 'blog', '텍스트': 'text', '개발·계산': 'dev' };

export const tools: Tool[] = [
  { slug: 'speed', name: '인터넷 속도체크', short: '속도체크', desc: '다운로드 속도·핑·지터 측정', icon: 'speed', group: '네트워크', primary: true },
  { slug: 'ip', name: 'IP 주소 조회', short: 'IP 조회', desc: '내 IP와 위치, 통신사 확인', icon: 'ip', group: '네트워크', primary: true },
  { slug: 'domain', name: '도메인 WHOIS 조회', short: '후이즈 조회', desc: '등록일·만료일·네임서버 확인', icon: 'domain', group: '네트워크', primary: true },
  { slug: 'naver-check', name: '블로그 누락 체크', short: '블로그 누락 체크', desc: '네이버 통합검색·블로그탭 노출 확인', icon: 'blog', group: '블로그·마케팅', primary: true },
  { slug: 'link-mapping', name: '링크 텍스트 매핑', short: '링크 매핑', desc: '줄마다 링크를 걸어 HTML 만들기', icon: 'link', group: '텍스트' },
  { slug: 'utm', name: 'UTM 생성기', short: 'UTM', desc: '마케팅 추적용 URL 자동 조합', icon: 'utm', group: '블로그·마케팅' },
  { slug: 'char-count', name: '글자수 세기', short: '글자수 세기', desc: '공백 포함/제외, 바이트 계산', icon: 'char', group: '텍스트', primary: true },
  { slug: 'line-break', name: '줄바꿈·공백 제거기', short: '줄바꿈 제거', desc: '엔터와 불필요한 공백 정리', icon: 'linebreak', group: '텍스트' },
  { slug: 'case', name: '대소문자 변환', short: '대소문자', desc: '대/소문자, snake_case 등 변환', icon: 'case', group: '텍스트' },
  { slug: 'random-name', name: '랜덤 이름 생성기', short: '랜덤 이름', desc: '판타지·한글·브랜드 이름 생성', icon: 'dice', group: '텍스트' },
  { slug: 'favicon', name: '파비콘 만들기', short: '파비콘', desc: '글자와 색으로 파비콘 만들기', icon: 'favicon', group: '개발·계산' },
  { slug: 'json', name: 'JSON 정렬·검증', short: 'JSON', desc: 'JSON 정렬, 축소, 문법 검증', icon: 'json', group: '개발·계산' },
  { slug: 'base64', name: 'Base64 변환', short: 'Base64', desc: 'Base64 인코딩과 디코딩', icon: 'lock', group: '개발·계산' },
  { slug: 'url-encode', name: 'URL 인코딩', short: 'URL 인코딩', desc: 'URL 인코딩과 디코딩', icon: 'url', group: '개발·계산' },
  { slug: 'px-rem', name: 'PX ↔ REM 변환', short: 'PX·REM', desc: 'CSS 단위 실시간 변환', icon: 'ruler', group: '개발·계산' },
  { slug: 'dday', name: 'D-Day 계산기', short: 'D-Day', desc: '디데이와 날짜 간격 계산', icon: 'calendar', group: '개발·계산' },
];

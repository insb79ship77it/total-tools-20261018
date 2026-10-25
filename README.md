# WebTools

Astro + Cloudflare Pages Functions 기반 웹 도구 모음.

## 구조
- `src/data/tools.ts` 도구 목록 (여기에 추가하면 메뉴와 홈에 자동 반영)
- `src/data/site.ts` 사이트 이름, 문의 이메일 등 기본 정보
- `src/pages/tools/` 도구 페이지, `src/pages/` 서비스 소개·약관·방침·문의
- `functions/api/` 서버가 필요한 API (블로그 체크, IP 조회, WHOIS)

## 로컬 실행
```
npm install
npm run dev        # 화면 확인 (API 제외)
npm run cf:dev     # 빌드 후 Functions 포함 실행
```

## Cloudflare Pages 배포
- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- 

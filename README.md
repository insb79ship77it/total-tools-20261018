# WebTools

Astro + Cloudflare Pages Functions 기반 웹 도구 모음.

## 도구
- `/tools/speed/` 인터넷 속도체크
- `/tools/char-count/` 글자수 세기
- `/tools/naver-check/` 네이버 블로그 누락 체크 (`functions/api/` 사용)

## 로컬 실행
```
npm install
npm run dev        # 화면 확인 (API 제외)
npm run cf:dev     # 빌드 후 Functions 포함 실행 (블로그 체크 테스트)
```

## Cloudflare Pages 배포
- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- 저장소 루트의 `functions/` 폴더는 자동으로 API로 배포됩니다.

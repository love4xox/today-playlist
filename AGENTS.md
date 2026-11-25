# AGENTS.md

AI 코딩 에이전트(Cursor 등)가 이 저장소에서 작업할 때 따라야 할 규칙과 프로젝트 맥락입니다. 작업을 시작하기 전에 먼저 읽어 주세요.

## 1. 프로젝트 개요

- **이름:** TP26 ARCHIVE — TODAY'S PLAYLIST
- **목적:** 날씨와 무드에 맞춰 AI가 음악을 큐레이션하고, 마음에 드는 트랙을 개인 아카이브(VAULT)에 보관·감상하는 에디토리얼 스타일 웹앱
- **핵심 방향:** 별도 백엔드·DB 없이 브라우저 `localStorage`로 보관함을 관리하고, AI 추천만 서버 Route Handler로 처리
- **언어:** UI 문구와 문서는 한국어, 코드 식별자는 영어

## 2. 기술 스택

| 영역 | 기술 |
| :--- | :--- |
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS v4, CSS Variables (`--bg-lookbook`, `--bg-mixtape`, `--bg-vault`), Lucide React |
| AI | `@google/genai`, 모델 `gemini-3.5-flash` (Structured Outputs, 서버에서만 호출) |
| State / Storage | React Hooks (`useState`, `useEffect`, `useRef`), `localStorage` |
| Deployment | GitHub, Vercel |

## 3. 화면과 디렉터리 역할

| 화면 | 경로 | 파일 |
| :--- | :--- | :--- |
| 01. LOOKBOOK (큐레이션) | `/` | `src/app/page.tsx` |
| 02. MIXTAPE (스플릿 뷰) | `/mixtape` | `src/app/mixtape/page.tsx` |
| 03. VAULT (개인 보관함) | `/vault` | `src/app/vault/page.tsx` |

```text
src/
├── app/
│   ├── api/
│   │   ├── curate/route.ts     # Gemini 신곡 추천 API (JSON Schema 응답, 캐시 방지)
│   │   └── cover/route.ts      # 앨범 아트워크 + 30초 미리듣기 URL 조회
│   ├── mixtape/page.tsx
│   ├── vault/page.tsx
│   ├── globals.css             # 테마 변수, 폰트 유틸리티, .no-scrollbar
│   └── page.tsx
├── components/
│   ├── AlbumArtwork.tsx        # 정사각형 커버 렌더링 및 폴백
│   ├── CuratorPanel.tsx        # 큐레이션 컨트롤
│   ├── TopNav.tsx              # 내비게이션, 컨디션 표시, 보관함 카운트, 다크 모드 토글
│   └── VaultPanel.tsx          # 보관함 카드 및 추가 UI
└── lib/
    ├── playlist.ts             # 후보 트랙 중복 제거 및 검증
    └── types.ts                # Track, CurationResult, WeatherType, MoodType
```

## 4. 아키텍처 원칙

1. **AI 호출은 서버에서만.** Gemini 호출은 `src/app/api/curate/route.ts`에서만 하며, 클라이언트 코드에서 `@google/genai`를 import하거나 API 키를 노출하지 않습니다.
2. **AI 응답은 스키마로 받는다.** `/api/curate`는 JSON Schema(Structured Outputs)로 응답을 받고, 응답은 캐시되지 않게 유지합니다. 스키마를 바꾸면 `types.ts`와 프롬프트도 함께 맞춥니다.
3. **중복 제거와 검증은 코드로.** 후보 트랙의 중복 제거와 검증은 `src/lib/playlist.ts`에서 처리하고, AI 응답을 그대로 믿지 않습니다.
4. **보관함은 `localStorage`.** 별도 백엔드·DB·로그인을 추가하지 않습니다. 필요해 보이면 먼저 사용자에게 확인합니다.
5. **오디오 상태는 항상 정리한다.** 트랙을 전환하거나 재선곡할 때 이전 오디오 재생과 진행률이 남지 않도록 `useEffect` 정리(cleanup) 로직을 유지합니다.

## 5. 데이터와 저장

- 핵심 타입(`Track`, `CurationResult`, `WeatherType`, `MoodType`)은 `src/lib/types.ts`가 기준입니다. 타입에 없는 속성은 참조하지 않습니다.
- 입력 조건
  - 날씨: `맑음` / `비` / `흐림` / `눈` / `밤/새벽`
  - 무드: `집중` / `잔잔함` / `신남` / `위로` / `드라이브`
  - 추천 곡 수: `01 ~ 06`

| 저장 키 | 용도 |
| :--- | :--- |
| `today_playlist_vault_v1` | VAULT 보관함 트랙 목록 |

- 저장 형태를 바꿀 때는 기존 `localStorage` 데이터가 깨지지 않는지 먼저 확인하고, 필요하면 키 버전(`_v1` → `_v2`)을 올립니다.

## 6. 디자인 규칙

에디토리얼 음반 속지(Liner Notes) 감성을 유지합니다.

- 페이지별 배경은 `globals.css`의 CSS 변수(`--bg-lookbook`, `--bg-mixtape`, `--bg-vault`)로만 지정하고, 컴포넌트에 색상 값을 직접 쓰지 않습니다.
- 폰트는 유틸리티 클래스를 씁니다: 세리프 `font-editorial-serif`, 그로테스크 `font-grotesk`, 모노스페이스 `font-mono-meta`.
- 모든 앨범 커버 프레임은 `aspect-square`로 통일합니다.
- 스크롤바 숨김은 `@layer utilities` 안의 `.no-scrollbar`를 사용하고, `globals.css`에 같은 선언을 중복해서 만들지 않습니다.
- 라이트 / 다크 테마 양쪽에서 모두 자연스럽게 보여야 합니다. (토글은 `TopNav`)
- MIXTAPE은 좌측 커버·코멘트·재생 컨트롤, 우측 트랙 리스트의 2단 스플릿 구조이며 가로 스크롤이 생기지 않아야 합니다.

## 7. API 규칙

- `POST /api/curate`: 날씨, 무드, 추천 곡 수, 보관함 트랙, 시드(`seed`)를 받아 신곡 플레이리스트와 한 줄 에디토리얼 코멘트를 반환합니다. 보관함에 있는 트랙은 중복 추천하지 않으며, 보관함이 비어 있어도 동작해야 합니다.
- `/api/cover`: 트랙의 앨범 아트워크와 30초 미리듣기 URL을 조회합니다.
- 요청/응답 형식을 바꾸면 호출하는 화면(`page.tsx`, `mixtape/page.tsx`, `CuratorPanel.tsx`)도 함께 확인합니다.

## 8. 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드 (타입 검사 포함, Vercel 배포 전 확인)
```

- 환경 변수: `.env.local`의 `GEMINI_API_KEY` (Git 추적 제외)

## 9. AI 협업 규칙

### 해야 할 것

- 변경 전에 관련 파일을 먼저 읽고, 기존 구조와 네이밍을 따릅니다.
- **화면 확인.** UI나 기능을 바꾼 뒤에는 `npm run dev`로 개발 서버를 띄워 LOOKBOOK, MIXTAPE, VAULT에서 동작을 직접 확인합니다.
- **빌드 확인.** 타입이나 API 응답 구조를 바꿨다면 `npm run build`로 타입 오류가 없는지 확인합니다. (이전에 `CurationResult`에 없는 속성을 참조해 Vercel 빌드가 실패한 적이 있습니다.)
- 변경은 작은 단위로 하고, 무엇을 왜 바꿨는지 짧게 요약합니다.
- 새 UI는 기존 디자인 규칙과 에디토리얼 스타일에 맞춥니다.

### 하지 말 것

- `.env.local`을 열어 키를 출력하거나, API 키를 코드·문서·커밋에 넣지 않습니다.
- 사용자 요청 없이 새 의존성, 백엔드, DB, 로그인 기능을 추가하지 않습니다.
- 요청받지 않은 범위의 리팩터링이나 파일 이동을 하지 않습니다.
- `types.ts`에 없는 속성을 참조하거나, 타입 오류를 `any`로 덮어 넘기지 않습니다.
- 삭제·덮어쓰기처럼 되돌리기 어려운 작업은 먼저 확인합니다.

### 작업 완료 기준

1. `npm run dev`에서 해당 기능이 라이트/다크 양쪽 테마로 정상 표시
2. 오디오를 건드렸다면 트랙 전환 후 이전 재생과 진행률이 남지 않음
3. `npm run build` 통과
4. 변경한 내용과 확인한 방법을 요약해서 보고

## 10. 배포

- GitHub 저장소를 Vercel에 연결해 배포합니다.
- Vercel **Settings → Environment Variables**에 `GEMINI_API_KEY`를 등록해야 신곡 추천이 동작합니다.
- 배포 주소: [TODAY PLAYLIST | 에디토리얼 사운드 아카이브](https://playlist-62q8w42q1-mind-mate1.vercel.app/)

# TP26 ARCHIVE — TODAY'S PLAYLIST

날씨와 무드에 맞춰 감각적인 음악을 큐레이션하고, 마음에 드는 트랙을 개인 아카이브에 보관·감상하는 에디토리얼 스타일의 AI 플레이리스트 웹 애플리케이션입니다.

🔗 **배포 주소:** [TODAY PLAYLIST | 에디토리얼 사운드 아카이브](https://playlist-62q8w42q1-mind-mate1.vercel.app/)

---

## 목차

1. [주요 특징](#1-주요-특징)
2. [핵심 기능](#2-핵심-기능)
3. [기술 스택](#3-기술-스택)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [시작하기](#5-시작하기)
6. [API 명세](#6-api-명세)
7. [배포 (Vercel)](#7-배포-vercel)
8. [트러블슈팅 및 개선 로그](#8-트러블슈팅-및-개선-로그)

---

## 1. 주요 특징

| 특징 | 설명 |
| :--- | :--- |
| **컨디션 기반 AI 큐레이션** | 날씨·무드·추천 곡 수를 선택하면 Gemini가 신곡 플레이리스트와 한 줄 에디토리얼 코멘트를 생성합니다. 보관함에 이미 저장된 트랙은 중복 추천을 피합니다. |
| **클라이언트 스토리지 보관함** | 별도 백엔드 없이 `localStorage`로 개인 음악 보관함을 브라우저에 영속 저장합니다. |
| **에디토리얼 UI** | 세리프·그로테스크·모노스페이스 타이포그래피를 조합해 음반 속지(Liner Notes) 감성을 구현하고, 라이트 / 다크 테마를 지원합니다. |

---

## 2. 핵심 기능

### 01. LOOKBOOK — `/` · `app/page.tsx`

에디토리얼 큐레이션 뷰입니다.

- **컨디션 기반 AI 신곡 추천 (`POST /api/curate`):** 날씨(`맑음`, `비`, `흐림`, `눈`, `밤/새벽`), 무드(`집중`, `잔잔함`, `신남`, `위로`, `드라이브`), 추천 곡 수(`LIMIT: 01~06`)를 선택해 새로운 플레이리스트를 생성합니다.
- **보관함 중복 회피 & 시드 다양화:** 이미 보관함(`VAULT`)에 저장된 트랙은 중복 추천을 피하고, 매 요청마다 시드(`seed`)와 무작위성을 반영해 신선한 선곡과 한 줄 코멘트를 제공합니다.
- **즉시 보관 (`+ SAVE TO VAULT`):** 클릭 한 번으로 `03. VAULT`에 저장하며, 이미 보관된 곡은 `SAVED IN VAULT ✓`로 자동 표시됩니다.
- **30초 미리듣기 (`PLAY 30S` / `PAUSE 30S`):** `/api/cover`로 미리듣기 URL과 앨범 아트워크를 조회하며, 트랙을 전환하면 이전 오디오 상태와 진행률을 자동으로 초기화합니다.

### 02. MIXTAPE — `/mixtape` · `app/mixtape/page.tsx`

매거진 스플릿 플레이리스트 뷰입니다.

- **2단 스플릿 에디토리얼 레이아웃:** 좌측에는 선택한 트랙의 정사각형 앨범 커버, 코멘트, 30초 미리듣기 컨트롤을, 우측에는 전체 트랙 번호 리스트(`01~06`)를 배치해 가로 스크롤 없는 화면을 제공합니다.
- **실시간 트랙 전환 & 오디오 연동:** 우측 트랙 행을 클릭하면 좌측 커버와 코멘트가 즉시 바뀌고, 재생 중이던 오디오도 자동으로 정리됩니다.

### 03. VAULT — `/vault` · `app/vault/page.tsx`

개인 사운드 아카이브입니다.

- **클라이언트 스토리지 기반 트랙 관리:** `localStorage`(`today_playlist_vault_v1`)로 브라우저에서 보관함을 영속 관리합니다.
- **앨범 아트워크 & 태그 아카이빙:** 수동으로 추가한 앨범과 룩북에서 저장한 추천곡을 장르, 무드 태그, 메모와 함께 정사각형 그리드로 모아 봅니다.

### 04. 다크 모드 & 에디토리얼 타이포그래피 — `TopNav.tsx`

- **라이트 / 다크 테마 전환:** `TopNav`의 `DARK` 토글로 따뜻한 페이퍼 톤의 라이트 모드와 차콜 톤의 다크 모드를 부드럽게 전환합니다.
- **타이포그래피 시스템:** 세리프(`font-editorial-serif`), 그로테스크(`font-grotesk`), 모노스페이스(`font-mono-meta`)를 조합합니다.

---

## 3. 기술 스택

| 영역 | 기술 | 역할 |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router), React, TypeScript | 페이지 라우팅, 서버 Route Handler, 타입 안전성 |
| **Styling** | Tailwind CSS v4, CSS Variables (`--bg-lookbook`, `--bg-mixtape`, `--bg-vault`), Lucide React | 페이지별 배경 테마 변수, 아이콘 |
| **AI & API** | Google Gemini API (`@google/genai` — `gemini-3.5-flash` Structured Outputs), Next.js Route Handlers | 날씨/무드별 신곡 추천 생성, JSON Schema 응답 |
| **State & Storage** | React Hooks (`useState`, `useEffect`, `useRef`), Browser `localStorage` | 화면 상태 및 오디오 제어, 보관함 영속 저장 |
| **Deployment** | GitHub, Vercel | 소스 관리 및 프로덕션 배포 |

---

## 4. 프로젝트 구조

```text
<project-folder>/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── curate/
│   │   │   │   └── route.ts        # Gemini 기반 날씨/무드별 신곡 추천 API (JSON Schema 응답 & 캐시 방지)
│   │   │   └── cover/
│   │   │       └── route.ts        # 앨범 아트워크 및 30초 미리듣기 URL 조회 API
│   │   ├── mixtape/
│   │   │   └── page.tsx            # 02. MIXTAPE: 좌측 커버 + 우측 트랙리스트 스플릿 뷰 & 30초 재생
│   │   ├── vault/
│   │   │   └── page.tsx            # 03. VAULT: 개인 음악 보관함 조회, 추가 및 삭제
│   │   ├── globals.css             # 테마 컬러 변수, 폰트 유틸리티, .no-scrollbar 스타일
│   │   └── page.tsx                # 01. LOOKBOOK: 메인 큐레이션, 30초 미리듣기, 즉시 보관
│   ├── components/
│   │   ├── AlbumArtwork.tsx        # 정사각형 앨범 커버 렌더링 및 폴백 처리
│   │   ├── CuratorPanel.tsx        # 큐레이션 컨트롤 및 스트립 컴포넌트
│   │   ├── TopNav.tsx              # 상단 내비게이션, 현재 컨디션, 보관함 카운트, 다크 모드 토글
│   │   └── VaultPanel.tsx          # 보관함 앨범 카드 및 추가 UI
│   └── lib/
│       ├── playlist.ts             # 후보 트랙 중복 제거 및 검증 유틸리티
│       └── types.ts                # Track, CurationResult, WeatherType, MoodType 타입
├── .env.local                      # GEMINI_API_KEY (Git 추적 제외)
└── README.md
```

---

## 5. 시작하기

### 사전 준비

- Node.js 및 npm
- Google Gemini API 키

### 설치 및 실행

```bash
# 1. 저장소 클론 및 이동
git clone <repository-url>
cd <project-folder>

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (루트 경로에 .env.local 생성)
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local

# 4. 개발 서버 실행 → http://localhost:3000
npm run dev
```

### 환경 변수

| 변수 | 필수 | 설명 |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | ✅ | 신곡 추천 생성에 사용하는 Gemini API 키 |

---

## 6. API 명세

### `POST /api/curate`

날씨, 무드, 추천 곡 수, 보관함 트랙 정보, 시드를 바탕으로 Gemini가 신곡 플레이리스트와 한 줄 에디토리얼 코멘트를 생성합니다.

- 응답은 JSON Schema(Structured Outputs) 형태로 검증되며, 캐시되지 않도록 처리합니다.
- 보관함에 이미 있는 트랙은 중복 추천을 피합니다.
- 입력 조건
  - 날씨: `맑음` / `비` / `흐림` / `눈` / `밤/새벽`
  - 무드: `집중` / `잔잔함` / `신남` / `위로` / `드라이브`
  - 추천 곡 수: `01 ~ 06`

### `/api/cover`

트랙의 앨범 아트워크와 30초 미리듣기 URL을 조회합니다.

---

## 7. 배포 (Vercel)

### 1) GitHub 푸시

```powershell
git add README.md
git commit -m "docs: 프로젝트 기능, 구조 및 트러블슈팅 README 정리"
git push origin main
```

### 2) Vercel 프로젝트 연결

1. Vercel 대시보드에서 **Add New... → Project**를 선택하고 저장소를 Import 합니다.
2. **Settings → Environment Variables**에서 `GEMINI_API_KEY`를 등록합니다.
3. **Deploy**를 실행합니다.

---

## 8. 트러블슈팅 및 개선 로그

| 항목 | 내용 |
| :--- | :--- |
| **스크롤바 및 프레임 비율 통일** | `globals.css`의 중복 선언을 정리해 `@layer utilities` 안에 `.no-scrollbar`를 정의하고, 모든 앨범 커버 프레임을 `aspect-square`로 통일해 가로 왜곡과 기본 브라우저 스크롤바를 제거했습니다. |
| **믹스테이프 레이아웃 개편** | 상단 여백이 비어 보이던 가로 필름스트립 구조를 매거진 스플릿 뷰(좌측 커버·코멘트·`PLAY 30S` / 우측 트랙리스트)로 재설계했습니다. |
| **TypeScript 빌드 오류 해결** | `CurationResult` 타입에 존재하지 않던 `weather`·`mood` 속성 참조를 정리해 Vercel 프로덕션 타입 검사를 통과시켰습니다. |
| **신곡 추천 및 즉시 보관 워크플로우 전환** | 보관함이 비어 있어도 새 곡을 추천받을 수 있도록 `/api/curate` 프롬프트·스키마를 확장하고, 추천 화면에서 바로 보관함에 추가하는 `+ SAVE TO VAULT` 기능을 구현했습니다. |
| **곡 전환 시 오디오 상태 초기화** | 트랙 이동 및 재선곡 시 이전 오디오 재생과 진행률이 남지 않도록 `useEffect` 정리 로직을 보완했습니다. |

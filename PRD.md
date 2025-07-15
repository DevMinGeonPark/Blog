# PRD: Obsidian-AI 블로그 플랫폼

## 1. 개요
Obsidian에서 작성된 마크다운 문서를 **Gemini CLI** 와 **Claude CLI**를 이용해 자동으로 정적 블로그로 변환하고, GitHub Pages(또는 유사 무료 호스팅)로 배포하는 완전 자동화 파이프라인을 구축한다. 모든 코드 생성을 AI 에이전트가 담당하며, **TDD(Test-Driven Development)** 방식으로 테스트까지 자동 작성·실행·통과한 뒤 Git 커밋/푸시까지 수행한다.

## 2. 목표
| 구분 | 목표 |
|---|---|
|MVP|• Obsidian 플러그인에서 "Publish" 버튼으로 문서를 블로그에 노출<br>• Gemini CLI 가 플러그인/사이트/테스트/워크플로 코드를 생성·수정<br>• Jest 기반 테스트 자동 통과 후 GitHub Actions 로 CI/CD
|확장|• Claude CLI 로 대규모 코드 리팩터링·문서화 지원<br>• 다국어(i18n) 지원, 커스텀 도메인 연동

## 3. 사용자 시나리오
1. **작성자**가 Obsidian 에서 글을 작성한다.
2. 왼쪽 리본의 "Publish" 버튼을 클릭 → 해당 파일 `published: true` 메타데이터 설정.
3. 저장 시 GitHub push 트리거 → GitHub Actions 가 실행된다.
4. Gemini CLI Action (step) 이 코드를 검토·테스트·빌드·배포한다.
5. 최종 사이트는 `https://<user>.github.io/<repo>/` 에 자동 반영된다.

## 4. 기술 스택 선정
| 영역 | 도구 | 선정 이유 |
|---|---|---|
|정적 사이트 | **Astro** + Markdown Collections | 마크다운 친화적, 빠른 빌드, GitHub Pages 호환|
|Obsidian 플러그인 | TypeScript + obsidian-api | 공식 샘플 기반, LLM 코드 생성 용이|
|테스트 | **Jest** (+ astro/test) | JS 전용, CLI 실행 간단, GitHub Actions 캐싱 용이|
|AI Agent | **Gemini CLI** (주 개발) / **Claude CLI** (리팩터링) | 무료 쿼터·1M 토큰, 도구 호출 지원 / 장문 추론 강점|
|CI/CD | GitHub Actions + `withastro/action` | 무료 Runner, Pages 배포 액션 제공|

## 5. 시스템 아키텍처
```
┌──────────┐    publish     ┌───────────────┐  PR/Commit  ┌──────────────┐
│ Obsidian │──────────────▶│ Local Git Repo│───────────▶│ GitHub Repo  │
└──────────┘                └───────────────┘            │  (main)      │
     ▲                                             CI    │ Actions Runners
     │ Gemini/Claude CLI 호출                             │  • Install
     │                                                   │  • Test (Jest)
     │                                                   │  • Build (Astro)
     │                                                   │  • Deploy (Pages)
     └───────────────────────────────────────────────────┴──────────────┘
```

## 6. 상세 기능 요구사항
### 6.1 Obsidian 플러그인
- 명령: `publish-current-file` / `toggle-publish` / `bulk-publish`.
- UI: 리본 아이콘 + 파일 헤더 체크박스.
- 플래그: 프론트매터 `published: true` / false.
- 빌드 아웃풋: `./blog_src/` 폴더에 게시 대상 마크다운 복사.
- 테스트: 플러그인 초기화, 리본 클릭 시 메타데이터 변경 확인(Jest + obsidian-api mocks).

### 6.2 정적 블로그( Astro )
- 디렉터리: `src/content/blog/*.md` (Obsidian RSS 폴더와 동기화)
- 레이아웃 컴포넌트: `BlogLayout.astro` (제목/날짜/태그/본문)
- 라우팅: `/` (포스트 리스트), `/posts/[slug]` (개별 포스트)
- 스타일: Tailwind CSS(선택) 또는 기본.

### 6.3 TDD & 테스트 자동화
```bash
# 예시 워크플로 단계
- name: AI Generate Tests
  run: |
    gemini exec "Write Jest unit & e2e tests for changed files"
- name: Run Tests
  run: npm test -- --runInBand
```
- 실패 시 워크플로 중단, Git commit 취소.

### 6.4 CI/CD 파이프라인 (deploy.yml)
```yaml
name: CI & Deploy
on:
  push:
    branches: [main]
permissions:
  contents: write
  pages: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v4
        with:
          node-version: 22
      - name: Run Jest
        run: npm ci && npm test
```

## 7. AI 프롬프트 템플릿
### 7.1 Gemini CLI – 플러그인 생성
```
#prompt
You are an expert Obsidian plugin developer.
Task: Create a TypeScript plugin named "obsidian-publisher" with the following features:
1. Add a ribbon icon titled "Publish" that toggles front-matter `published`.
2. Copy published files to ./blog_src preserving folder paths.
3. Provide command palette entries (see details ...)
Write complete code, package.json, manifest.json, and Jest tests.
```

### 7.2 Gemini CLI – 워크플로 수정
```
#prompt
Write or update .github/workflows/deploy.yml so that after tests pass, Astro is built and deployed to GitHub Pages using withastro/action. Ensure node 22 and pnpm.
```

### 7.3 Claude CLI – 리팩터링 & 문서화
```
#prompt
Refactor src/plugins/obsidian-publisher/main.ts for readability, add JSDoc, keep behaviour identical, update tests accordingly.
```

## 8. 마일스톤 & 일정(예시)
|주차|작업|담당 에이전트|
|---|---|---|
|1주|• PRD 확정·Repo 초기화|인간
|2주|• Obsidian 플러그인 v0 생성|Gemini CLI
|3주|• 테스트 자동화, CI 파이프라인|Gemini CLI
|4주|• Astro 블로그 테마 작성|Gemini CLI
|5주|• 클라우드 배포 검증, 버그 픽스|Claude CLI

## 9. 향후 개선 아이디어
- 이미지 자동 최적화(LLM 호출 + Sharp)
- AI 요약문 생성 후 OG 메타 태그 삽입
- 댓글 시스템(utterances 또는 giscus)

---
**수정 방법**: 필요한 섹션을 자유롭게 편집 후 `main` 브랜치에 커밋하면 CI가 실행됩니다.
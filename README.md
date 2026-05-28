# chatbot-test

OpenAI API를 사용한 간단한 챗봇 예제 프로젝트입니다.

## 설치 및 실행

1. 의존성 설치

```bash
npm install
```

2. 서버 시작

```bash
npm start
```

3. 브라우저에서 열기

```bash
http://localhost:3000
```

4. 웹 UI에서 OpenAI API Key 등록

- `API 키 등록` 화면에 OpenAI 키를 입력하고 저장합니다.
- 서버 메모리에 임시 저장된 키로 API 호출이 실행됩니다.
- 브라우저에서 로컬 저장소로 관리되므로, 새로고침 시 자동으로 다시 등록됩니다.

## 프로젝트 구조

- `server.js`: Express 서버 및 OpenAI API 호출
- `public/index.html`: 챗봇 UI
- `public/app.js`: 프론트엔드 요청 및 채팅 UI 처리
- `public/styles.css`: UI 스타일
- `.gitignore`: `node_modules` 및 `.env` 제외

## 주요 기능

- 모델 선택 (gpt-4o-mini, gpt-4.1, gpt-3.5-turbo)
- 온도 설정
- 시스템 프롬프트 입력
- 간단한 채팅 기록 표시

## 참고

- OpenAI API 키는 웹 UI `API 키 등록` 화면을 통해 등록할 수 있습니다.
- `.env` 파일에 `OPENAI_API_KEY`를 설정하면 서버가 기본 키로 사용할 수 있습니다.
- 필요하면 `systemPrompt`를 수정해 챗봇 성향을 바꾸세요.


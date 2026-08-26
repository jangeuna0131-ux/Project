모바일 청첩장 실행 안내
========================

1. index.html을 브라우저에서 열면 기본 화면을 확인할 수 있습니다.
   (권장: VS Code Live Server 또는 GitHub Pages)

2. 실제 데이터 입력 위치
   ./js/script.js 상단 CONFIG
   - groomPhone
   - bridePhone
   - kakaoMapApiKey  ← 카카오맵 JavaScript 키 입력 위치
   - venueAddress
   - googleAppsScriptUrl

3. 카카오맵 연결
   - Kakao Developers에서 애플리케이션 생성
   - JavaScript 키 발급
   - 사용할 웹사이트 도메인 등록 (예: http://127.0.0.1:5500 또는 GitHub Pages 주소)
   - ./js/script.js 상단 CONFIG.kakaoMapApiKey = "여기에 JavaScript 키"; 로 입력
   - REST API 키나 Admin 키가 아니라 JavaScript 키를 사용하세요.
   - 네이버 지도 기능은 제거되어 있습니다.
   - 카카오맵은 페이지 안에 직접 표시되며, "카카오맵에서 보기" 버튼도 제공됩니다.

4. 이미지 교체
   ./images/main.jpg
   ./images/couple01.jpg ~ couple06.jpg
   동일 파일명으로 실제 사진을 덮어쓰면 됩니다.

5. 방명록 Google Sheets 연결
   - Google Sheets 새 문서 생성
   - apps-script.gs 내용을 Apps Script에 붙여넣기
   - SPREADSHEET_ID 입력
   - 웹 앱으로 배포 (실행 사용자: 나 / 액세스: 모든 사용자)
   - 배포된 URL을 ./js/script.js 의 CONFIG.googleAppsScriptUrl 에 입력

6. 주의
   - 2026년 9월 1일은 실제로 화요일입니다. 화면은 TUE/TUESDAY로 구현되어 있습니다.
   - 브라우저 보안 정책상 Clipboard API는 HTTPS 또는 localhost에서 가장 안정적으로 동작합니다.

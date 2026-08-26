# WORLD WEATHER — 4 TAB APP

이번 버전은 화면을 **4개의 탭**으로 명확하게 분리했습니다.

## 4개 탭

1. **오늘**
   - 현재 도시
   - 현지시간
   - 현재온도
   - 체감온도
   - 최고/최저
   - 습도/바람/일출/일몰 Quick View

2. **예보**
   - 3시간 간격 시간대별 날씨
   - 5일 예보

3. **상세**
   - 습도
   - 바람/풍향
   - 체감온도
   - 가시거리
   - 기압
   - 구름량
   - 일출/일몰

4. **저장도시**
   - 즐겨찾기 도시
   - 최근 검색 도시

## 김포 추가

다음 검색을 지원합니다.

```text
김포
김포시
Gimpo
```

`config.js`의 기본 도시도 `김포`로 설정되어 있습니다.

## API Key 설정

`js/config.js`

```js
window.WEATHER_CONFIG = {
  API_KEY: "YOUR_OPENWEATHER_API_KEY",
  DEFAULT_CITY: "김포",
  DEFAULT_UNIT: "metric"
};
```

`YOUR_OPENWEATHER_API_KEY`만 실제 Key로 교체하세요.

## 실행

VS Code의 Live Server 사용을 권장합니다.

```text
index.html → 우클릭 → Open with Live Server
```

## 로딩 화면이 안 사라지던 문제 수정

이번 버전에는 다음 CSS가 들어 있습니다.

```css
[hidden] {
  display: none !important;
}
```

또한 API 요청에 12초 timeout을 넣어서 네트워크 문제가 생겨도 로딩 화면이 영구적으로 남지 않습니다.

## Console 확인

F12 → Console에서 다음을 확인할 수 있습니다.

- 사용자 검색어
- Geocoding API 응답
- 선택된 위치
- Current Weather API 응답
- Forecast API 응답
- 렌더링 직전 데이터

## 폴더 구조

```text
world-weather-tabs-app/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ config.js
│  └─ app.js
└─ README.md
```

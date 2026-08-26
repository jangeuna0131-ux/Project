"use strict";

/* ========================================
   WORLD WEATHER - 4 TAB APP
======================================== */

const CONFIG = window.WEATHER_CONFIG || {};
const API_KEY = CONFIG.API_KEY || "";
const DEFAULT_CITY = CONFIG.DEFAULT_CITY || "김포";

const state = {
  unit: CONFIG.DEFAULT_UNIT === "imperial" ? "imperial" : "metric",
  activeTab: "today",
  location: null,
  weather: null,
  forecast: null,
  favorites: loadStorage("ww_favorites", []),
  recent: loadStorage("ww_recent", []),
  clockTimer: null,
  candidates: []
};

/* 한글 지명 fallback - 김포/김포시 추가 */
const CITY_ALIASES = {
  "김포": "Gimpo",
  "김포시": "Gimpo",
  "서울": "Seoul",
  "부산": "Busan",
  "대구": "Daegu",
  "인천": "Incheon",
  "광주": "Gwangju",
  "대전": "Daejeon",
  "울산": "Ulsan",
  "제주": "Jeju",
  "제주시": "Jeju City",
  "도쿄": "Tokyo",
  "오사카": "Osaka",
  "교토": "Kyoto",
  "후쿠오카": "Fukuoka",
  "삿포로": "Sapporo",
  "베이징": "Beijing",
  "북경": "Beijing",
  "상하이": "Shanghai",
  "홍콩": "Hong Kong",
  "타이베이": "Taipei",
  "런던": "London",
  "파리": "Paris",
  "로마": "Rome",
  "밀라노": "Milan",
  "베를린": "Berlin",
  "뮌헨": "Munich",
  "마드리드": "Madrid",
  "바르셀로나": "Barcelona",
  "암스테르담": "Amsterdam",
  "프라하": "Prague",
  "비엔나": "Vienna",
  "뉴욕": "New York",
  "로스앤젤레스": "Los Angeles",
  "엘에이": "Los Angeles",
  "샌프란시스코": "San Francisco",
  "시카고": "Chicago",
  "보스턴": "Boston",
  "시애틀": "Seattle",
  "라스베이거스": "Las Vegas",
  "라스베가스": "Las Vegas",
  "시드니": "Sydney",
  "멜버른": "Melbourne",
  "오클랜드": "Auckland",
  "방콕": "Bangkok",
  "싱가포르": "Singapore",
  "하노이": "Hanoi",
  "호치민": "Ho Chi Minh City",
  "다낭": "Da Nang",
  "마닐라": "Manila",
  "세부": "Cebu City",
  "두바이": "Dubai"
};

/* 김포까지 확실하게 동작시키기 위한 좌표 fallback */
const CITY_COORDINATE_FALLBACKS = {
  "김포": {
    name: "Gimpo",
    local_names: { ko: "김포", en: "Gimpo" },
    lat: 37.6152,
    lon: 126.7156,
    country: "KR",
    state: "Gyeonggi-do"
  },
  "김포시": {
    name: "Gimpo",
    local_names: { ko: "김포", en: "Gimpo" },
    lat: 37.6152,
    lon: 126.7156,
    country: "KR",
    state: "Gyeonggi-do"
  }
};

const COUNTRY_KO = {
  KR: "대한민국", JP: "일본", CN: "중국", TW: "대만", HK: "홍콩",
  GB: "영국", FR: "프랑스", DE: "독일", IT: "이탈리아", ES: "스페인",
  PT: "포르투갈", NL: "네덜란드", BE: "벨기에", AT: "오스트리아",
  CZ: "체코", HU: "헝가리", GR: "그리스", TR: "튀르키예", CH: "스위스",
  DK: "덴마크", SE: "스웨덴", NO: "노르웨이", FI: "핀란드", IE: "아일랜드",
  IS: "아이슬란드", US: "미국", CA: "캐나다", MX: "멕시코",
  AU: "호주", NZ: "뉴질랜드", TH: "태국", SG: "싱가포르",
  MY: "말레이시아", VN: "베트남", PH: "필리핀", ID: "인도네시아",
  AE: "아랍에미리트", IN: "인도"
};

const WEATHER_EMOJI = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌫️",
  Squall: "💨",
  Tornado: "🌪️"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dom = {
  searchForm: $("#searchForm"),
  cityInput: $("#cityInput"),
  searchPanel: $("#searchPanel"),
  candidateWrap: $("#candidateWrap"),
  candidateList: $("#candidateList"),
  recentWrap: $("#recentWrap"),
  recentList: $("#recentList"),
  clearRecentBtn: $("#clearRecentBtn"),
  statusBox: $("#statusBox"),
  locationBtn: $("#locationBtn"),
  unitBtn: $("#unitBtn"),
  unitLabel: $("#unitLabel"),
  favoriteBtn: $("#favoriteBtn"),
  loadingOverlay: $("#loadingOverlay"),

  countryName: $("#countryName"),
  cityName: $("#cityName"),
  localDate: $("#localDate"),
  currentTemp: $("#currentTemp"),
  weatherEmoji: $("#weatherEmoji"),
  weatherDescription: $("#weatherDescription"),
  feelsLike: $("#feelsLike"),
  todayHigh: $("#todayHigh"),
  todayLow: $("#todayLow"),

  quickHumidity: $("#quickHumidity"),
  quickWind: $("#quickWind"),
  quickSunrise: $("#quickSunrise"),
  quickSunset: $("#quickSunset"),

  hourlyForecast: $("#hourlyForecast"),
  dailyForecast: $("#dailyForecast"),

  humidity: $("#humidity"),
  windSpeed: $("#windSpeed"),
  windDirection: $("#windDirection"),
  detailFeelsLike: $("#detailFeelsLike"),
  visibility: $("#visibility"),
  pressure: $("#pressure"),
  cloudiness: $("#cloudiness"),
  sunrise: $("#sunrise"),
  sunset: $("#sunset"),

  favoriteCities: $("#favoriteCities"),
  recentCitiesPanel: $("#recentCitiesPanel")
};

/* ========================================
   Storage
======================================== */

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("localStorage 저장 실패", error);
  }
}

/* ========================================
   Utilities
======================================== */

function hasApiKey() {
  return Boolean(API_KEY && API_KEY !== "YOUR_OPENWEATHER_API_KEY");
}

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isKorean(text) {
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
}

function countryName(code) {
  return COUNTRY_KO[code] || code || "국가 정보 없음";
}

function displayCity(location) {
  return location?.local_names?.ko || location?.displayName || location?.name || "알 수 없는 도시";
}

function roundTemp(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : "--";
}

function windUnit() {
  return state.unit === "metric" ? "m/s" : "mph";
}

function iconUrl(code) {
  return code ? `https://openweathermap.org/img/wn/${code}@2x.png` : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sameLocation(a, b) {
  return Math.abs(Number(a.lat) - Number(b.lat)) < 0.01 &&
         Math.abs(Number(a.lon) - Number(b.lon)) < 0.01;
}

function serializeLocation(location) {
  return {
    name: location.name || "",
    displayName: displayCity(location),
    country: location.country || state.weather?.sys?.country || "",
    state: location.state || "",
    lat: Number(location.lat),
    lon: Number(location.lon),
    local_names: {
      ko: location.local_names?.ko || displayCity(location),
      en: location.local_names?.en || location.name || ""
    }
  };
}

function cityDate(timestampSec, timezoneSec) {
  return new Date((timestampSec + timezoneSec) * 1000);
}

function cityClock(timezoneSec, timestampSec = Math.floor(Date.now() / 1000)) {
  const d = cityDate(timestampSec, timezoneSec);
  const day = new Intl.DateTimeFormat("ko-KR", {
    month: "long", day: "numeric", weekday: "long", timeZone: "UTC"
  }).format(d);
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC"
  }).format(d);
  return `${day} · ${time}`;
}

function cityTime(timestampSec, timezoneSec) {
  if (!timestampSec) return "--:--";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC"
  }).format(cityDate(timestampSec, timezoneSec));
}

function forecastHour(timestampSec, timezoneSec) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit", hour12: false, timeZone: "UTC"
  }).format(cityDate(timestampSec, timezoneSec)) + "시";
}

function dateKey(timestampSec, timezoneSec) {
  const d = cityDate(timestampSec, timezoneSec);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function weekday(timestampSec, timezoneSec, first = false) {
  if (first) return "오늘";
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "long", timeZone: "UTC"
  }).format(cityDate(timestampSec, timezoneSec));
}

function degToCompass(deg) {
  if (!Number.isFinite(Number(deg))) return "--";
  const d = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
  return d[Math.round(Number(deg) / 45) % 8];
}

/* ========================================
   Loading / Status
======================================== */

function showLoading() {
  dom.loadingOverlay.hidden = false;
}

function hideLoading() {
  dom.loadingOverlay.hidden = true;
}

function showStatus(message, type = "error") {
  dom.statusBox.hidden = false;
  dom.statusBox.textContent = message;
  dom.statusBox.classList.toggle("info", type === "info");
}

function clearStatus() {
  dom.statusBox.hidden = true;
  dom.statusBox.textContent = "";
  dom.statusBox.classList.remove("info");
}

/* ========================================
   API - timeout 포함
======================================== */

async function fetchJson(url, label, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json().catch(() => null);

    /* PRD 요구: 서버 응답을 화면 출력 전에 console.log로 확인 */
    console.log(`📡 ${label}`);
    console.log(data);

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}`;
      throw new Error(`${response.status}: ${message}`);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getCoordinates(city) {
  const url =
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
    `&limit=5&appid=${API_KEY}`;
  return fetchJson(url, `Geocoding API (${city})`);
}

async function reverseGeocode(lat, lon) {
  const url =
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}` +
    `&limit=1&appid=${API_KEY}`;
  return fetchJson(url, "Reverse Geocoding API");
}

async function getWeather(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
    `&appid=${API_KEY}&units=${state.unit}&lang=kr`;
  return fetchJson(url, "Current Weather API");
}

async function getForecast(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}` +
    `&appid=${API_KEY}&units=${state.unit}&lang=kr`;
  return fetchJson(url, "5 Day / 3 Hour Forecast API");
}

/* ========================================
   4 Tab Navigation
======================================== */

function switchTab(tabName) {
  state.activeTab = tabName;

  $$(".tab-btn").forEach((btn) => {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  $$(".tab-panel").forEach((panel) => {
    const active = panel.dataset.panel === tabName;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

/* ========================================
   Search
======================================== */

async function searchCity(raw) {
  const query = normalize(raw);

  if (!query) {
    showStatus("도시 이름을 입력해주세요.");
    return;
  }

  console.log("🔍 사용자 검색어:", query);

  let results = await getCoordinates(query);
  console.log("🌍 1차 검색 결과:", results);

  if (!results.length && isKorean(query) && CITY_ALIASES[query]) {
    console.log(`🔄 한글 fallback: ${query} → ${CITY_ALIASES[query]}`);
    results = await getCoordinates(CITY_ALIASES[query]);
  }

  /* 김포는 Geocoding 결과가 불안정해도 도시 좌표 fallback 보장 */
  if (!results.length && CITY_COORDINATE_FALLBACKS[query]) {
    results = [CITY_COORDINATE_FALLBACKS[query]];
    console.log("📍 좌표 fallback 사용:", results);
  }

  console.log("✅ 최종 도시 후보:", results);

  if (!results.length) {
    showStatus(`"${query}" 도시를 찾을 수 없습니다.`);
    renderCandidates([]);
    return;
  }

  state.candidates = results;

  if (results.length === 1) {
    await selectLocation(results[0], query);
  } else {
    renderCandidates(results, query);
    openSearchPanel();
  }
}

async function searchCityWeather(raw) {
  if (!hasApiKey()) {
    showStatus("js/config.js의 YOUR_OPENWEATHER_API_KEY를 본인의 OpenWeather API Key로 교체해주세요.", "info");
    return;
  }

  try {
    showLoading();
    clearStatus();
    await searchCity(raw);
  } catch (error) {
    console.error("❌ 검색 오류:", error);
    showStatus(friendlyError(error));
  } finally {
    hideLoading();
  }
}

async function selectLocation(location, originalSearch = "") {
  state.location = {
    ...location,
    displayName: location.local_names?.ko || originalSearch || location.name
  };

  console.log("📍 선택된 위치:", state.location);

  await loadLocationWeather();
  addRecent(state.location);
  updateFavoriteButton();

  dom.cityInput.value = "";
  closeSearchPanel();
  switchTab("today");
}

function renderCandidates(list, originalSearch = "") {
  dom.candidateList.innerHTML = "";

  if (!list.length) {
    dom.candidateWrap.hidden = true;
    return;
  }

  dom.candidateWrap.hidden = false;

  list.forEach((location) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-item";

    btn.innerHTML = `
      <span>
        <strong>${escapeHtml(location.local_names?.ko || location.name)}</strong>
        <small>${escapeHtml(countryName(location.country))}${location.state ? ` · ${escapeHtml(location.state)}` : ""}</small>
      </span>
      <span aria-hidden="true">›</span>
    `;

    btn.addEventListener("click", async () => {
      try {
        showLoading();
        clearStatus();
        await selectLocation(location, originalSearch);
      } catch (error) {
        console.error(error);
        showStatus(friendlyError(error));
      } finally {
        hideLoading();
      }
    });

    dom.candidateList.appendChild(btn);
  });
}

function openSearchPanel() {
  const hasContent = !dom.candidateWrap.hidden || !dom.recentWrap.hidden;
  dom.searchPanel.hidden = !hasContent;
  dom.cityInput.setAttribute("aria-expanded", String(hasContent));
}

function closeSearchPanel() {
  dom.searchPanel.hidden = true;
  dom.cityInput.setAttribute("aria-expanded", "false");
}

/* ========================================
   Weather Load
======================================== */

async function loadLocationWeather() {
  const { lat, lon } = state.location;

  const [weather, forecast] = await Promise.all([
    getWeather(lat, lon),
    getForecast(lat, lon)
  ]);

  state.weather = weather;
  state.forecast = forecast;

  console.log("☀️ 렌더링 직전 현재 날씨:", weather);
  console.log("📅 렌더링 직전 예보:", forecast);

  renderAll();
}

function renderAll() {
  renderToday();
  renderForecast();
  renderDetails();
  renderFavorites();
  renderRecentCities();
  updateUnitLabel();
  updateFavoriteButton();
}

/* ========================================
   TAB 1 - Today
======================================== */

function renderToday() {
  const w = state.weather;
  if (!w || !state.location) return;

  const tz = w.timezone || state.forecast?.city?.timezone || 0;
  const days = buildDailyGroups();
  const first = days[0];

  dom.countryName.textContent = countryName(state.location.country || w.sys?.country);
  dom.cityName.textContent = displayCity(state.location);
  dom.localDate.textContent = cityClock(tz);
  dom.currentTemp.textContent = `${roundTemp(w.main?.temp)}°`;
  dom.weatherDescription.textContent = w.weather?.[0]?.description || "날씨 정보 없음";
  dom.feelsLike.textContent = `체감온도 ${roundTemp(w.main?.feels_like)}°`;

  const high = first ? Math.max(first.max, Number(w.main?.temp)) : w.main?.temp_max;
  const low = first ? Math.min(first.min, Number(w.main?.temp)) : w.main?.temp_min;
  dom.todayHigh.textContent = `최고 ${roundTemp(high)}°`;
  dom.todayLow.textContent = `최저 ${roundTemp(low)}°`;

  const main = w.weather?.[0]?.main || "Clear";
  dom.weatherEmoji.textContent = WEATHER_EMOJI[main] || "🌤️";
  document.body.dataset.weather = main;

  dom.quickHumidity.textContent = `${w.main?.humidity ?? "--"}%`;
  dom.quickWind.textContent = `${Number(w.wind?.speed ?? 0).toFixed(1)} ${windUnit()}`;
  dom.quickSunrise.textContent = cityTime(w.sys?.sunrise, tz);
  dom.quickSunset.textContent = cityTime(w.sys?.sunset, tz);

  if (state.clockTimer) clearInterval(state.clockTimer);
  state.clockTimer = setInterval(() => {
    dom.localDate.textContent = cityClock(tz);
  }, 30000);
}

/* ========================================
   TAB 2 - Forecast
======================================== */

function renderForecast() {
  const f = state.forecast;
  if (!f?.list?.length) return;

  const tz = f.city?.timezone || state.weather?.timezone || 0;

  dom.hourlyForecast.innerHTML = f.list.slice(0, 8).map((item, i) => `
    <article class="hour-card">
      <span class="hour-time">${i === 0 ? "다음" : forecastHour(item.dt, tz)}</span>
      <img src="${iconUrl(item.weather?.[0]?.icon)}" alt="${escapeHtml(item.weather?.[0]?.description || "")}">
      <strong class="hour-temp">${roundTemp(item.main?.temp)}°</strong>
      <span class="muted-hour">${escapeHtml(item.weather?.[0]?.description || "")}</span>
    </article>
  `).join("");

  const days = buildDailyGroups();
  const globalMin = Math.min(...days.map((d) => d.min));
  const globalMax = Math.max(...days.map((d) => d.max));
  const span = Math.max(globalMax - globalMin, 1);

  dom.dailyForecast.innerHTML = days.map((day, i) => {
    const item = day.rep;
    const left = ((day.min - globalMin) / span) * 64;
    const width = Math.max(((day.max - day.min) / span) * 64, 12);

    return `
      <div class="day-row">
        <div class="day-name">
          <strong>${weekday(day.timestamp, tz, i === 0)}</strong>
          <small>${day.key.slice(5).replace("-", ".")}</small>
        </div>

        <div class="day-weather">
          <img src="${iconUrl(item.weather?.[0]?.icon)}" alt="">
          <span class="day-desc">${escapeHtml(item.weather?.[0]?.description || "")}</span>
        </div>

        <div class="day-temps">
          <span>${roundTemp(day.min)}°</span>
          <span>${roundTemp(day.max)}°</span>
        </div>

        <div class="range-track" aria-hidden="true">
          <span style="left:${left}%;width:${Math.min(width, 100-left)}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function buildDailyGroups() {
  const f = state.forecast;
  if (!f?.list?.length) return [];

  const tz = f.city?.timezone || state.weather?.timezone || 0;
  const map = new Map();

  f.list.forEach((item) => {
    const key = dateKey(item.dt, tz);

    if (!map.has(key)) {
      map.set(key, {
        key,
        timestamp: item.dt,
        min: Infinity,
        max: -Infinity,
        items: []
      });
    }

    const g = map.get(key);
    g.items.push(item);
    g.min = Math.min(g.min, Number(item.main?.temp_min ?? item.main?.temp));
    g.max = Math.max(g.max, Number(item.main?.temp_max ?? item.main?.temp));
  });

  return [...map.values()].slice(0, 5).map((g) => {
    const rep = g.items.reduce((best, item) => {
      const h1 = cityDate(item.dt, tz).getUTCHours();
      const h2 = cityDate(best.dt, tz).getUTCHours();
      return Math.abs(h1 - 12) < Math.abs(h2 - 12) ? item : best;
    }, g.items[0]);

    return { ...g, rep };
  });
}

/* ========================================
   TAB 3 - Details
======================================== */

function renderDetails() {
  const w = state.weather;
  if (!w) return;

  const tz = w.timezone || 0;

  dom.humidity.textContent = `${w.main?.humidity ?? "--"}%`;
  dom.windSpeed.textContent = `${Number(w.wind?.speed ?? 0).toFixed(1)} ${windUnit()}`;
  dom.windDirection.textContent = `풍향 ${degToCompass(w.wind?.deg)}`;
  dom.detailFeelsLike.textContent = `${roundTemp(w.main?.feels_like)}°`;
  dom.visibility.textContent = Number.isFinite(Number(w.visibility))
    ? `${(Number(w.visibility) / 1000).toFixed(1)} km`
    : "-- km";
  dom.pressure.textContent = `${w.main?.pressure ?? "--"} hPa`;
  dom.cloudiness.textContent = `${w.clouds?.all ?? "--"}%`;
  dom.sunrise.textContent = cityTime(w.sys?.sunrise, tz);
  dom.sunset.textContent = cityTime(w.sys?.sunset, tz);
}

/* ========================================
   TAB 4 - Favorites / Recent
======================================== */

function isFavorite() {
  if (!state.location) return false;
  return state.favorites.some((x) => sameLocation(x, state.location));
}

function toggleFavorite() {
  if (!state.location) {
    showStatus("먼저 도시를 검색해주세요.", "info");
    return;
  }

  const item = serializeLocation(state.location);

  if (isFavorite()) {
    state.favorites = state.favorites.filter((x) => !sameLocation(x, item));
  } else {
    state.favorites = [item, ...state.favorites].slice(0, 9);
  }

  saveStorage("ww_favorites", state.favorites);
  updateFavoriteButton();
  renderFavorites();
}

function updateFavoriteButton() {
  const active = isFavorite();
  dom.favoriteBtn.classList.toggle("is-active", active);
  dom.favoriteBtn.setAttribute("aria-pressed", String(active));
  dom.favoriteBtn.querySelector(".favorite-text").textContent = active ? "저장됨" : "즐겨찾기";
  dom.favoriteBtn.querySelector("span:first-child").textContent = active ? "★" : "☆";
}

async function renderFavorites() {
  if (!state.favorites.length) {
    dom.favoriteCities.innerHTML = `
      <div class="empty-state card">
        오늘 탭에서 ☆ 버튼을 눌러 도시를 저장하세요.
      </div>
    `;
    return;
  }

  const list = state.favorites.slice(0, 6);

  dom.favoriteCities.innerHTML = list.map((loc, i) => `
    <article class="city-card" data-favorite-index="${i}" tabindex="0">
      <button class="remove-btn" type="button" data-remove-index="${i}" aria-label="삭제">×</button>
      <h4>${escapeHtml(loc.displayName || loc.name)}</h4>
      <small>${escapeHtml(countryName(loc.country))}</small>
      <strong class="city-card-temp">--°</strong>
      <div class="city-card-footer">날씨 불러오는 중...</div>
    </article>
  `).join("");

  attachFavoriteEvents(list);

  if (!hasApiKey()) return;

  const results = await Promise.allSettled(list.map((loc) => getWeather(loc.lat, loc.lon)));

  results.forEach((result, i) => {
    if (result.status !== "fulfilled") return;

    const card = dom.favoriteCities.querySelector(`[data-favorite-index="${i}"]`);
    if (!card) return;

    const w = result.value;
    card.querySelector(".city-card-temp").textContent = `${roundTemp(w.main?.temp)}°`;
    card.querySelector(".city-card-footer").innerHTML = `
      <img src="${iconUrl(w.weather?.[0]?.icon)}" alt="">
      <span>${escapeHtml(w.weather?.[0]?.description || "")}</span>
    `;
  });
}

function attachFavoriteEvents(list) {
  $$("[data-favorite-index]").forEach((card) => {
    const open = async () => {
      const loc = list[Number(card.dataset.favoriteIndex)];
      if (!loc) return;

      try {
        showLoading();
        clearStatus();
        state.location = loc;
        await loadLocationWeather();
        addRecent(loc);
        switchTab("today");
      } catch (error) {
        showStatus(friendlyError(error));
      } finally {
        hideLoading();
      }
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-remove-index]")) return;
      open();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") open();
    });
  });

  $$("[data-remove-index]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const loc = list[Number(btn.dataset.removeIndex)];
      state.favorites = state.favorites.filter((x) => !sameLocation(x, loc));
      saveStorage("ww_favorites", state.favorites);
      updateFavoriteButton();
      renderFavorites();
    });
  });
}

function addRecent(location) {
  const item = serializeLocation(location);
  state.recent = [item, ...state.recent.filter((x) => !sameLocation(x, item))].slice(0, 8);
  saveStorage("ww_recent", state.recent);
  renderRecentSearchPanel();
  renderRecentCities();
}

function renderRecentSearchPanel() {
  if (!state.recent.length) {
    dom.recentWrap.hidden = true;
    dom.recentList.innerHTML = "";
    return;
  }

  dom.recentWrap.hidden = false;
  dom.recentList.innerHTML = state.recent.map((loc, i) => `
    <button class="search-item" type="button" data-recent-search="${i}">
      <span>
        <strong>${escapeHtml(loc.displayName || loc.name)}</strong>
        <small>${escapeHtml(countryName(loc.country))}</small>
      </span>
      <span aria-hidden="true">↗</span>
    </button>
  `).join("");

  $$("[data-recent-search]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await openStoredLocation(state.recent[Number(btn.dataset.recentSearch)]);
    });
  });
}

function renderRecentCities() {
  if (!state.recent.length) {
    dom.recentCitiesPanel.innerHTML = `<div class="empty-state card">최근 검색한 도시가 없습니다.</div>`;
    return;
  }

  dom.recentCitiesPanel.innerHTML = state.recent.slice(0, 6).map((loc, i) => `
    <article class="city-card" data-recent-card="${i}" tabindex="0">
      <h4>${escapeHtml(loc.displayName || loc.name)}</h4>
      <small>${escapeHtml(countryName(loc.country))}</small>
      <strong class="city-card-temp">다시 보기</strong>
      <div class="city-card-footer">저장된 검색 위치</div>
    </article>
  `).join("");

  $$("[data-recent-card]").forEach((card) => {
    const open = () => openStoredLocation(state.recent[Number(card.dataset.recentCard)]);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") open();
    });
  });
}

async function openStoredLocation(loc) {
  if (!loc) return;

  try {
    showLoading();
    clearStatus();
    state.location = loc;
    await loadLocationWeather();
    addRecent(loc);
    closeSearchPanel();
    switchTab("today");
  } catch (error) {
    showStatus(friendlyError(error));
  } finally {
    hideLoading();
  }
}

/* ========================================
   Current Location
======================================== */

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 기능을 지원하지 않습니다."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    });
  });
}

async function useCurrentLocation() {
  if (!hasApiKey()) {
    showStatus("먼저 js/config.js에서 API Key를 설정해주세요.", "info");
    return;
  }

  try {
    showLoading();
    clearStatus();

    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    console.log("📍 현재 위치 좌표:", { lat, lon });

    const reverse = await reverseGeocode(lat, lon);
    const loc = reverse[0] || {
      name: "현재 위치",
      local_names: { ko: "현재 위치" },
      country: "",
      lat,
      lon
    };

    loc.lat = lat;
    loc.lon = lon;

    await selectLocation(loc, "현재 위치");
  } catch (error) {
    console.error(error);
    if (error?.code === 1) {
      showStatus("위치 권한이 거부되었습니다. 브라우저 위치 권한을 허용하거나 도시를 직접 검색해주세요.");
    } else {
      showStatus(friendlyError(error));
    }
  } finally {
    hideLoading();
  }
}

/* ========================================
   Unit
======================================== */

async function toggleUnit() {
  state.unit = state.unit === "metric" ? "imperial" : "metric";
  updateUnitLabel();

  if (!state.location || !hasApiKey()) {
    renderFavorites();
    return;
  }

  try {
    showLoading();
    await loadLocationWeather();
  } catch (error) {
    showStatus(friendlyError(error));
  } finally {
    hideLoading();
  }
}

function updateUnitLabel() {
  dom.unitLabel.textContent = state.unit === "metric" ? "°C" : "°F";
}

/* ========================================
   Errors
======================================== */

function friendlyError(error) {
  const message = String(error?.message || "");

  if (message.includes("401")) {
    return "OpenWeather API Key가 올바르지 않거나 아직 활성화되지 않았습니다.";
  }

  if (message.includes("429")) {
    return "OpenWeather API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
  }

  if (message.includes("Failed to fetch")) {
    return "서버에 연결할 수 없습니다. Live Server로 실행했는지와 인터넷 연결을 확인해주세요.";
  }

  return message || "날씨 정보를 불러오지 못했습니다.";
}

/* ========================================
   Events
======================================== */

dom.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchCityWeather(dom.cityInput.value);
});

dom.cityInput.addEventListener("focus", () => {
  renderRecentSearchPanel();
  if (state.recent.length || state.candidates.length) openSearchPanel();
});

dom.cityInput.addEventListener("input", () => {
  state.candidates = [];
  renderCandidates([]);
  renderRecentSearchPanel();
  if (state.recent.length) openSearchPanel();
});

dom.clearRecentBtn.addEventListener("click", () => {
  state.recent = [];
  saveStorage("ww_recent", []);
  renderRecentSearchPanel();
  renderRecentCities();
  closeSearchPanel();
});

dom.locationBtn.addEventListener("click", useCurrentLocation);
dom.unitBtn.addEventListener("click", toggleUnit);
dom.favoriteBtn.addEventListener("click", toggleFavorite);

document.addEventListener("click", (e) => {
  if (!dom.searchForm.contains(e.target)) closeSearchPanel();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSearchPanel();
});

/* ========================================
   Init
======================================== */

async function init() {
  hideLoading();
  updateUnitLabel();
  renderRecentSearchPanel();
  renderRecentCities();
  renderFavorites();
  switchTab("today");

  if (!hasApiKey()) {
    showStatus(
      "앱 준비 완료. js/config.js에서 YOUR_OPENWEATHER_API_KEY를 네 OpenWeather API Key로 교체하면 기본 도시 김포부터 자동 조회됩니다.",
      "info"
    );
    return;
  }

  await searchCityWeather(DEFAULT_CITY);
}

init();

// ===============================
// 1. 사용자 설정값
// ===============================
const CONFIG = {
  weddingDate: "2026-09-01T12:00:00+09:00",
  groomPhone: "01012345678", // 예: "01012345678"
  bridePhone: "01098765432", // 예: "01098765432"

  // =========================================
  // ★ 카카오맵 API 키 입력 위치 ★
  // Kakao Developers에서 발급한 "JavaScript 키"를 아래 따옴표 안에 입력하세요.
  // 예: kakaoMapApiKey: "1234567890abcdef..."
  // REST API 키 / Admin 키가 아니라 JavaScript 키입니다.
  // =========================================
  kakaoMapApiKey: "c16a0674d447122a8ad0ec1c2e583519",

  venueName: "서울신라호텔 영빈관",
  venueAddress: "서울특별시 중구 동호로 249",

  googleAppsScriptUrl:
    "https://script.google.com/macros/s/AKfycbzMwONNyR5WRuT0-HoTR0mIy_dR03Vi5CUHUd9TTZc3CN7OdXzflCvcoFS1rlao-wrIzw/exec"
};


// 갤러리 이미지
const galleryImages = [
  "./images/couple01.png",
  "./images/couple02.png",
  "./images/couple03.png",
  "./images/couple04.png"
];
// ===============================
// 2. 공통 유틸
// ===============================
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2000);
}

function escapeText(value) {
  return String(value ?? "").replace(/[<>]/g, "");
}

// ===============================
// 3. Scroll Fade Up
// ===============================
function initReveal() {
  const items = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      obs.unobserve(entry.target); // 1회만 실행
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

// ===============================
// 4. 실시간 카운트다운
// ===============================
function animateNumber(element, nextValue) {
  if (element.textContent === nextValue) return;
  element.classList.add("flip");
  setTimeout(() => {
    element.textContent = nextValue;
    element.classList.remove("flip");
  }, 160);
}

function updateCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const now = Date.now();
  const diff = target - now;
  const status = $("#countdown-status");

  if (Number.isNaN(target)) {
    status.textContent = "결혼식 날짜 설정을 확인해주세요.";
    return;
  }

  if (diff <= 0) {
    const oneDay = 24 * 60 * 60 * 1000;
    const after = now - target;
    status.textContent = after < oneDay ? "오늘, 저희 결혼합니다." : "함께 축복해 주셔서 감사합니다.";
    ["days", "hours", "minutes", "seconds"].forEach((id) => animateNumber($("#" + id), "00"));
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  animateNumber($("#days"), String(days).padStart(2, "0"));
  animateNumber($("#hours"), String(hours).padStart(2, "0"));
  animateNumber($("#minutes"), String(minutes).padStart(2, "0"));
  animateNumber($("#seconds"), String(seconds).padStart(2, "0"));
}

// ===============================
// 5. 연락처 / 카카오맵 설정
// ===============================
function loadKakaoMapSdk() {
  return new Promise((resolve, reject) => {
    if (!CONFIG.kakaoMapApiKey) {
      reject(new Error("KAKAO_API_KEY_MISSING"));
      return;
    }

    // 이미 SDK가 로드되어 있다면 다시 불러오지 않습니다.
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve);
      return;
    }

    const existingScript = document.querySelector('script[data-kakao-map-sdk="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => window.kakao.maps.load(resolve), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("KAKAO_SDK_LOAD_FAILED")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMapSdk = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(CONFIG.kakaoMapApiKey)}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("KAKAO_SDK_INVALID"));
        return;
      }
      window.kakao.maps.load(resolve);
    };

    script.onerror = () => reject(new Error("KAKAO_SDK_LOAD_FAILED"));
    document.head.appendChild(script);
  });
}

async function initKakaoMap() {
  const mapContainer = $("#kakao-map");
  const mapStatus = $("#map-status");
  const mapLink = $("#kakao-map-link");

  // API 키가 없어도 카카오맵 검색 페이지 버튼은 사용할 수 있습니다.
  const searchKeyword = CONFIG.venueName || CONFIG.venueAddress || "서울신라호텔 영빈관";
  mapLink.href = `https://map.kakao.com/link/search/${encodeURIComponent(searchKeyword)}`;

  if (!CONFIG.kakaoMapApiKey) {
    mapStatus.hidden = false;
    mapStatus.textContent = "script.js 상단 CONFIG.kakaoMapApiKey에 카카오 JavaScript 키를 입력해주세요.";
    return;
  }

  try {
    await loadKakaoMapSdk();

    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780);
    const map = new kakao.maps.Map(mapContainer, {
      center: defaultCenter,
      level: 4
    });

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(CONFIG.venueAddress, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || !result.length) {
        mapStatus.hidden = false;
        mapStatus.textContent = "예식장 주소를 지도에서 찾지 못했습니다. CONFIG.venueAddress를 확인해주세요.";
        return;
      }

      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      const marker = new kakao.maps.Marker({
        map,
        position: coords
      });

      const label = document.createElement("div");
      label.className = "kakao-map-label";
      label.textContent = CONFIG.venueName;

      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="min-width:160px;padding:9px 12px;text-align:center;font-size:12px;white-space:nowrap;">${CONFIG.venueName}</div>`
      });
      infoWindow.open(map, marker);

      map.setCenter(coords);
      mapStatus.hidden = true;

      // 모바일 회전/리사이즈 후 타일 정렬 보정
      window.addEventListener("resize", () => map.relayout(), { passive: true });
    });
  } catch (error) {
    console.error(error);
    mapStatus.hidden = false;
    mapStatus.textContent = error.message === "KAKAO_API_KEY_MISSING"
      ? "script.js 상단 CONFIG.kakaoMapApiKey에 카카오 JavaScript 키를 입력해주세요."
      : "카카오 지도를 불러오지 못했습니다. API 키와 등록된 사이트 도메인을 확인해주세요.";
  }
}

function initContactAndLocation() {
  const groomCall = $("#groom-call");
  const brideCall = $("#bride-call");

  groomCall.href = CONFIG.groomPhone ? `tel:${CONFIG.groomPhone}` : "#";
  brideCall.href = CONFIG.bridePhone ? `tel:${CONFIG.bridePhone}` : "#";

  [groomCall, brideCall].forEach((button, index) => {
    button.addEventListener("click", (event) => {
      const phone = index === 0 ? CONFIG.groomPhone : CONFIG.bridePhone;
      if (!phone) {
        event.preventDefault();
        showToast("전화번호를 script.js에 입력해주세요.");
      }
    });
  });

  const venueAddress = $("#venue-address");
  venueAddress.textContent = CONFIG.venueAddress || "정확한 주소를 script.js에 입력해주세요.";

  $("#copy-address").addEventListener("click", async () => {
    if (!CONFIG.venueAddress) {
      showToast("먼저 주소를 입력해주세요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(CONFIG.venueAddress);
      showToast("주소가 복사되었습니다.");
    } catch {
      showToast("주소를 복사하지 못했습니다.");
    }
  });

  initKakaoMap();
}

// ===============================
// 6. 계좌 Accordion / 복사
// ===============================
function initAccount() {
  $$(".accordion-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panel = toggle.nextElementSibling;
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  $$(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.account);
        showToast("계좌번호가 복사되었습니다.");
      } catch {
        showToast("복사하지 못했습니다. 계좌번호를 직접 선택해주세요.");
      }
    });
  });
}

// ===============================
// 7. Gallery Slider + Modal
// ===============================
function initGallery() {
  const track = $("#gallery-track");
  const slides = $$(".gallery-slide");
  const prevButton = $("#gallery-prev");
  const nextButton = $("#gallery-next");
  const dots = $$(".gallery-dot");
  const currentText = $("#gallery-current");
  const totalText = $("#gallery-total");

  // 확대 모달
  const modal = $("#gallery-modal");
  const modalImage = $("#modal-image");
  const modalCount = $("#modal-count");

  let currentIndex = 0;

  // 모바일 스와이프용
  let touchStartX = 0;
  let touchEndX = 0;


  // ===============================
  // 슬라이드 화면 갱신
  // ===============================
  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // 하단 점 표시 변경
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    // 현재 번호
    currentText.textContent = currentIndex + 1;
    totalText.textContent = slides.length;
  }


  // ===============================
  // 이전 사진
  // ===============================
  function prevSlide() {
    currentIndex =
      (currentIndex - 1 + slides.length) % slides.length;

    updateSlider();
  }


  // ===============================
  // 다음 사진
  // ===============================
  function nextSlide() {
    currentIndex =
      (currentIndex + 1) % slides.length;

    updateSlider();
  }


  // 이전 버튼
  prevButton.addEventListener("click", prevSlide);

  // 다음 버튼
  nextButton.addEventListener("click", nextSlide);


  // ===============================
  // 하단 점 클릭
  // ===============================
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      currentIndex = Number(dot.dataset.slide);

      updateSlider();
    });
  });


  // ===============================
  // 모바일 손가락 Swipe
  // ===============================
  track.addEventListener(
    "touchstart",
    (event) => {
      touchStartX =
        event.changedTouches[0].clientX;
    },
    { passive: true }
  );


  track.addEventListener(
    "touchend",
    (event) => {
      touchEndX =
        event.changedTouches[0].clientX;

      const distance =
        touchStartX - touchEndX;


      // 오른쪽 → 왼쪽
      // 다음 사진
      if (distance > 50) {
        nextSlide();
      }


      // 왼쪽 → 오른쪽
      // 이전 사진
      if (distance < -50) {
        prevSlide();
      }
    },
    { passive: true }
  );


  // ===============================
  // 확대 Modal
  // ===============================
  function renderModal() {
    modalImage.src =
      galleryImages[currentIndex];

    modalImage.alt =
      `확대된 웨딩 사진 ${currentIndex + 1}`;

    modalCount.textContent =
      `${currentIndex + 1} / ${galleryImages.length}`;
  }


  // 모달 열기
  function openModal(index) {
    currentIndex = index;

    updateSlider();
    renderModal();

    modal.classList.add("open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";
  }


  // 모달 닫기
  function closeModal() {
    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";
  }


  // 사진 클릭하면 확대
  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      openModal(
        Number(slide.dataset.index)
      );
    });
  });


  // 모달 닫기
  $("#modal-close").addEventListener(
    "click",
    closeModal
  );


  // 모달 이전 사진
  $("#modal-prev").addEventListener(
    "click",
    () => {
      currentIndex =
        (currentIndex - 1 + galleryImages.length)
        % galleryImages.length;

      updateSlider();
      renderModal();
    }
  );


  // 모달 다음 사진
  $("#modal-next").addEventListener(
    "click",
    () => {
      currentIndex =
        (currentIndex + 1)
        % galleryImages.length;

      updateSlider();
      renderModal();
    }
  );


  // 검은 배경 클릭하면 닫기
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        closeModal();
      }
    }
  );


  // 키보드 조작
  document.addEventListener(
    "keydown",
    (event) => {
      if (!modal.classList.contains("open")) {
        return;
      }

      // ESC
      if (event.key === "Escape") {
        closeModal();
      }

      // 왼쪽 방향키
      if (event.key === "ArrowLeft") {
        $("#modal-prev").click();
      }

      // 오른쪽 방향키
      if (event.key === "ArrowRight") {
        $("#modal-next").click();
      }
    }
  );


  // 처음 화면
  updateSlider();
}

// ===============================
// 9. 초기 실행
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initContactAndLocation();
  initAccount();
  initGallery();
  initGuestbook();

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
// ===============================
// 8. Google Sheets 방명록
// ===============================

function renderGuestbook(items) {
  const list = $("#guestbook-list");

  list.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("p");

    empty.className = "guestbook-empty";
    empty.textContent =
      "아직 첫 축하 메시지를 기다리고 있어요.";

    list.appendChild(empty);

    return;
  }

  items.forEach((item) => {
    const card =
      document.createElement("article");

    card.className = "guestbook-card";


    const top =
      document.createElement("div");

    top.className =
      "guestbook-card__top";


    const name =
      document.createElement("strong");

    name.textContent =
      escapeText(item.name || "익명");


    const time =
      document.createElement("time");

    time.textContent =
      escapeText(item.createdAt || "");


    const message =
      document.createElement("p");

    message.textContent =
      escapeText(item.message || "");


    top.append(name, time);

    card.append(top, message);

    list.appendChild(card);
  });
}


// ===============================
// 방명록 불러오기
// ===============================

async function loadGuestbook() {
  const list = $("#guestbook-list");

  if (!CONFIG.googleAppsScriptUrl) {
    list.innerHTML =
      '<p class="guestbook-empty">Google Apps Script URL을 연결하면 실제 방명록이 표시됩니다.</p>';

    return;
  }


  list.innerHTML =
    '<p class="guestbook-loading">방명록을 불러오고 있습니다...</p>';


  try {
    const response = await fetch(
      `${CONFIG.googleAppsScriptUrl}?action=list&ts=${Date.now()}`
    );


    if (!response.ok) {
      throw new Error("load failed");
    }


    const result =
      await response.json();


    renderGuestbook(
      Array.isArray(result.items)
        ? result.items
        : []
    );

  } catch (error) {
    console.error(error);

    list.innerHTML =
      '<p class="guestbook-empty">방명록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>';
  }
}


// ===============================
// 방명록 등록
// ===============================

function initGuestbook() {
  const form =
    $("#guestbook-form");

  const nameInput =
    $("#guest-name");

  const messageInput =
    $("#guest-message");

  const submit =
    $("#guestbook-submit");

  const messageCount =
    $("#message-count");

  const formMessage =
    $("#form-message");


  // 글자수 표시
  messageInput.addEventListener(
    "input",
    () => {
      messageCount.textContent =
        messageInput.value.length;
    }
  );


  // 등록
  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const name =
        nameInput.value.trim();

      const message =
        messageInput.value.trim();


      if (!name) {
        formMessage.textContent =
          "이름을 입력해주세요.";

        nameInput.focus();

        return;
      }


      if (name.length > 20) {
        formMessage.textContent =
          "이름은 20자 이하로 입력해주세요.";

        return;
      }


      if (!message) {
        formMessage.textContent =
          "축하 메시지를 입력해주세요.";

        messageInput.focus();

        return;
      }


      if (message.length > 200) {
        formMessage.textContent =
          "축하 메시지는 200자 이하로 작성해주세요.";

        return;
      }


      if (!CONFIG.googleAppsScriptUrl) {
        formMessage.textContent =
          "Google Apps Script URL을 먼저 연결해주세요.";

        return;
      }


      submit.disabled = true;

      submit.textContent =
        "등록 중...";

      formMessage.textContent = "";


      try {

        const body =
          new URLSearchParams({
            action: "create",
            name,
            message
          });


        const response =
          await fetch(
            CONFIG.googleAppsScriptUrl,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8"
              },

              body
            }
          );


        if (!response.ok) {
          throw new Error(
            "submit failed"
          );
        }


        const result =
          await response.json();


        if (!result.ok) {
          throw new Error(
            result.message ||
            "submit failed"
          );
        }


        form.reset();

        messageCount.textContent =
          "0";

        formMessage.textContent =
          "축하 메시지가 등록되었습니다.";

        showToast(
          "축하 메시지가 등록되었습니다."
        );


        await loadGuestbook();

      } catch (error) {

        console.error(error);

        formMessage.textContent =
          "메시지를 등록하지 못했습니다. 잠시 후 다시 시도해주세요.";

      } finally {

        submit.disabled = false;

        submit.textContent =
          "축하 메시지 남기기";
      }
    }
  );


  loadGuestbook();
}
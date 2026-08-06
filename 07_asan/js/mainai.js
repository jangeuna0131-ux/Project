"use strict";


/* =========================
   메인 배너 Swiper
========================= */
const mainSwiper = new Swiper(".mainSwiper", {
    /* 한 화면에 슬라이드 한 장 */
    slidesPerView: 1,

    /* 슬라이드 사이 간격 */
    spaceBetween: 0,

    /* 마지막 다음에 첫 번째 슬라이드로 연결 */
    loop: true,

    /* 슬라이드 전환 속도 */
    speed: 650,

    /* 자동 슬라이드 */
    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },

    /* 페이지네이션 */
    pagination: {
        el: ".mainSwiper .swiper-pagination",
        clickable: true
    },

    /* 이전·다음 버튼 */
    navigation: {
        nextEl: ".mainSwiper .swiper-button-next",
        prevEl: ".mainSwiper .swiper-button-prev"
    },

    /* 키보드 조작 */
    keyboard: {
        enabled: true
    },

    /* 접근성 설정 */
    a11y: {
        enabled: true,
        prevSlideMessage: "이전 배너",
        nextSlideMessage: "다음 배너",
        firstSlideMessage: "첫 번째 배너입니다",
        lastSlideMessage: "마지막 배너입니다",
        paginationBulletMessage: "{{index}}번째 배너로 이동"
    }
});
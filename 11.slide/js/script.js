$(function () {


    // =========================================================
    // 카테고리 더보기
    // =========================================================

    $(".category-more").click(function () {


        $(this).toggleClass("on");


        if ($(this).hasClass("on")) {

            $(this).html(
                '접기 <span>∧</span>'
            );

        } else {

            $(this).html(
                '더보기 <span>∨</span>'
            );

        }


    });


});





// =========================================================
// MAIN VISUAL SWIPER
// 3초마다 자동 이동
// =========================================================

const mainSwiper = new Swiper(".mainSwiper", {


    // 한 화면에 1개
    slidesPerView: 1,


    // 1개씩 이동
    slidesPerGroup: 1,


    // 무한 반복
    loop: true,


    // 이동 속도
    speed: 700,


    // =====================================================
    // 자동재생
    // 3초마다 이동
    // =====================================================
    autoplay: {

        delay: 3000,

        disableOnInteraction: false

    },


    // 좌우 버튼
    navigation: {

        nextEl: ".main-next",

        prevEl: ".main-prev"

    },


    // 현재 페이지
    on: {


        init: function () {

            $(".current-page").text(
                this.realIndex + 1
            );

            $(".total-page").text(
                this.slides.length
            );

        },


        slideChange: function () {

            $(".current-page").text(
                this.realIndex + 1
            );

        }


    }


});





// =========================================================
// VACATION PRODUCT SWIPER
//
// 한 화면에 4개
// 3초마다 1개씩 이동
// =========================================================

const vacationSwiper = new Swiper(".vacationSwiper", {


    // 한 화면에 상품 4개
    slidesPerView: 4,


    // 카드 사이 간격
    spaceBetween: 20,


    // 1개씩 이동
    slidesPerGroup: 1,


    // 무한 반복
    loop: true,


    // 이동 속도
    speed: 600,


    // =====================================================
    // 자동재생
    // 3초마다 이동
    // =====================================================
    autoplay: {

        delay: 3000,

        disableOnInteraction: false

    },


    // 좌우 버튼
    navigation: {

        nextEl: ".vacation-next",

        prevEl: ".vacation-prev"

    }


});
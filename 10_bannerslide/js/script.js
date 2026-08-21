/* ========================================
   설화수 추천 Swiper
======================================== */

const recommendSwiper = new Swiper(".recommend-swiper", {

    /* 한 화면에 3개 */
    slidesPerView: 3,

    /* 카드 사이 간격 */
    spaceBetween: 24,

    /* 좌우 버튼은 1개씩 이동 */
    slidesPerGroup: 1,

    /* 무한 반복 */
    loop: true,

    /* 슬라이드 이동 속도 */
    speed: 700,

    /* 기본 autoplay는 사용하지 않음 */
    autoplay: false,


    /* ========================================
       좌우 버튼
       클릭할 때는 1개씩 이동
    ======================================== */
    navigation: {

        nextEl: ".recommend-next",

        prevEl: ".recommend-prev"

    },


    /* ========================================
       진행 막대
    ======================================== */
    pagination: {

        el: ".recommend-swiper-pagination",

        type: "progressbar"

    }

});


/* ========================================
   자동 슬라이드
   3초마다 3개씩 이동
======================================== */

let autoTimer;

let isPaused = false;


function startAutoSlide() {

    autoTimer = setInterval(function () {

        if (isPaused === false) {

            /*
                현재 위치에서
                다음 상품 3개만큼 이동
            */
            recommendSwiper.slideToLoop(
                (recommendSwiper.realIndex + 3) % 6,
                700
            );

        }

    }, 3000);

}


/* 자동 슬라이드 시작 */
startAutoSlide();


/* ========================================
   정지 / 재생 버튼
======================================== */

const controlBtn =
    document.querySelector(".recommend-control-btn");


controlBtn.addEventListener("click", function () {

    /* 재생 중 → 정지 */
    if (isPaused === false) {

        isPaused = true;

        clearInterval(autoTimer);

        controlBtn.classList.add("play");

        controlBtn.setAttribute(
            "aria-label",
            "슬라이드 재생"
        );

    }


    /* 정지 중 → 재생 */
    else {

        isPaused = false;

        startAutoSlide();

        controlBtn.classList.remove("play");

        controlBtn.setAttribute(
            "aria-label",
            "슬라이드 정지"
        );

    }

});
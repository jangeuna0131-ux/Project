/* ========================================
   설화수 추천 Swiper
======================================== */

const recommendSwiper = new Swiper(".recommend-swiper", {

    /* 한 화면에 3개 */
    slidesPerView: 3,

    /* 카드 사이 간격 */
    spaceBetween: 24,

    /* 한 번에 1개씩 이동 */
    slidesPerGroup: 1,


    /* ========================================
       무한 반복
    ======================================== */

    /*
        마지막 슬라이드 다음에도
        첫 번째 슬라이드가 자연스럽게 이어짐
    */
    loop: true,


    /*
        원본 슬라이드 6개를 기준으로
        loop용 복제 슬라이드 생성
    */
    loopedSlides: 6,

    /*
        앞뒤 복제 슬라이드 추가
    */
    loopAdditionalSlides: 3,


    /* ========================================
       슬라이드 이동 속도
       설화수처럼 조금 빠르게
    ======================================== */
    speed: 600,


    /* ========================================
       자동 슬라이드
    ======================================== */
    autoplay: {

        /* 3초마다 1개씩 이동 */
        delay: 3000,

        /* 항상 다음 방향 */
        reverseDirection: false,

        /* 버튼을 눌러도 자동재생 유지 */
        disableOnInteraction: false

    },


    /* ========================================
       좌우 버튼
    ======================================== */
    navigation: {

        /* 오른쪽 = 다음 */
        nextEl: ".recommend-next",

        /* 왼쪽 = 이전 */
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
   정지 / 재생 버튼
======================================== */

const controlBtn =
    document.querySelector(".recommend-control-btn");


/* 처음에는 자동재생 중 */
let isPaused = false;


/* ========================================
   정지 / 재생 버튼 클릭
======================================== */

controlBtn.addEventListener("click", function () {

    /* ========================================
       재생 중 → 정지
    ======================================== */
    if (isPaused === false) {

        /* 자동재생 정지 */
        recommendSwiper.autoplay.stop();


        /* 재생 아이콘으로 변경 */
        controlBtn.classList.add("play");


        /* 접근성 문구 변경 */
        controlBtn.setAttribute(
            "aria-label",
            "슬라이드 재생"
        );


        /* 정지 상태 */
        isPaused = true;

    }


    /* ========================================
       정지 중 → 다시 재생
    ======================================== */
    else {

        /* 자동재생 다시 시작 */
        recommendSwiper.autoplay.start();


        /* 정지 아이콘으로 변경 */
        controlBtn.classList.remove("play");


        /* 접근성 문구 변경 */
        controlBtn.setAttribute(
            "aria-label",
            "슬라이드 정지"
        );


        /* 재생 상태 */
        isPaused = false;

    }

});
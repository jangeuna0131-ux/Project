document.addEventListener("DOMContentLoaded", function () {


    /* ========================================
       MAIN BANNER SLIDER
       - 총 3장
       - 3초 자동 슬라이드
       - 이전 / 다음
       - 정지 / 재생
       - 현재 번호 변경
       - 1 → 2 → 3 → 1 같은 방향 무한루프
    ======================================== */

    const mainTrack =
        document.querySelector(".main-slides");

    const originalMainSlides =
        document.querySelectorAll(".main-slide");

    const mainPrev =
        document.querySelector(".main-prev");

    const mainNext =
        document.querySelector(".main-next");

    const mainPause =
        document.querySelector(".main-pause");

    const mainCount =
        document.querySelector(".main-count strong");


    if (
        mainTrack &&
        originalMainSlides.length > 0
    ) {

        /* 원본 슬라이드 개수 */
        const totalMainSlides =
            originalMainSlides.length;


        /* ========================================
           무한루프용 복제

           구조 :
           [3 복제] [1] [2] [3] [1 복제]
        ======================================== */

        const firstClone =
            originalMainSlides[0]
                .cloneNode(true);

        const lastClone =
            originalMainSlides[
                totalMainSlides - 1
            ].cloneNode(true);


        firstClone.classList.add(
            "clone-slide"
        );

        lastClone.classList.add(
            "clone-slide"
        );


        /* 맨 앞에 3번 복제 */
        mainTrack.prepend(
            lastClone
        );


        /* 맨 뒤에 1번 복제 */
        mainTrack.appendChild(
            firstClone
        );


        /*
           trackIndex

           0 = 복제된 3
           1 = 실제 1
           2 = 실제 2
           3 = 실제 3
           4 = 복제된 1
        */

        let trackIndex = 1;

        let mainTimer = null;

        let mainPlaying = true;

        let mainMoving = false;

        const mainDelay = 3000;

        const mainDuration = 550;



        /* ========================================
           MAIN COUNT
        ======================================== */

        function updateMainCount() {

            if (!mainCount) {
                return;
            }


            let realIndex =
                trackIndex - 1;


            /* 맨 뒤 1번 복제 */
            if (
                realIndex >=
                totalMainSlides
            ) {

                realIndex = 0;

            }


            /* 맨 앞 3번 복제 */
            if (
                realIndex < 0
            ) {

                realIndex =
                    totalMainSlides - 1;

            }


            mainCount.textContent =
                realIndex + 1;

        }



        /* ========================================
           MAIN SLIDE MOVE
        ======================================== */

        function moveMainSlide(
            useTransition = true
        ) {

            if (!mainTrack) {
                return;
            }


            if (useTransition) {

                mainTrack.style.transition =
                    `transform ${mainDuration}ms ease`;

            } else {

                mainTrack.style.transition =
                    "none";

            }


            mainTrack.style.transform =
                `translateX(-${trackIndex * 100}%)`;


            updateMainCount();

        }



        /* ========================================
           MAIN NEXT

           1 → 2 → 3 → 복제1
        ======================================== */

        function nextMainSlide() {

            if (mainMoving) {
                return;
            }


            mainMoving = true;

            trackIndex++;

            moveMainSlide(true);

        }



        /* ========================================
           MAIN PREV

           1 → 복제3 → 실제3
        ======================================== */

        function prevMainSlide() {

            if (mainMoving) {
                return;
            }


            mainMoving = true;

            trackIndex--;

            moveMainSlide(true);

        }



        /* ========================================
           TRANSITION END
           복제 슬라이드에서 실제 슬라이드로
           순간 이동
        ======================================== */

        mainTrack.addEventListener(
            "transitionend",
            function () {


                /* 3 → 복제된 1까지 이동 완료 */
                if (
                    trackIndex ===
                    totalMainSlides + 1
                ) {

                    trackIndex = 1;

                    moveMainSlide(false);

                }


                /* 1 → 복제된 3까지 이전 완료 */
                if (
                    trackIndex === 0
                ) {

                    trackIndex =
                        totalMainSlides;

                    moveMainSlide(false);

                }


                mainMoving = false;

            }
        );



        /* ========================================
           MAIN AUTO PLAY
           3초
        ======================================== */

        function startMainAuto() {

            clearInterval(
                mainTimer
            );


            if (!mainPlaying) {
                return;
            }


            mainTimer =
                setInterval(
                    function () {

                        nextMainSlide();

                    },
                    mainDelay
                );

        }



        /* ========================================
           MAIN NEXT BUTTON
        ======================================== */

        if (mainNext) {

            mainNext.addEventListener(
                "click",
                function () {

                    nextMainSlide();

                    startMainAuto();

                }
            );

        }



        /* ========================================
           MAIN PREV BUTTON
        ======================================== */

        if (mainPrev) {

            mainPrev.addEventListener(
                "click",
                function () {

                    prevMainSlide();

                    startMainAuto();

                }
            );

        }



        /* ========================================
           MAIN PAUSE / PLAY
        ======================================== */

        if (mainPause) {

            mainPause.addEventListener(
                "click",
                function () {

                    mainPlaying =
                        !mainPlaying;


                    mainPause.classList.toggle(
                        "is-paused",
                        !mainPlaying
                    );


                    mainPause.setAttribute(
                        "aria-pressed",
                        String(
                            !mainPlaying
                        )
                    );


                    if (mainPlaying) {

                        startMainAuto();

                    } else {

                        clearInterval(
                            mainTimer
                        );

                    }

                }
            );

        }



        /* ========================================
           MAIN FIRST POSITION

           복제3 / 실제1 / 실제2 / 실제3 / 복제1
                  ↑ 여기서 시작
        ======================================== */

        moveMainSlide(false);

        startMainAuto();

    }





    /* ========================================
       COUPON SLIDER
       - 화면에 4개
       - 클릭할 때 한 칸씩 이동
    ======================================== */

    const couponList =
        document.querySelector(".coupon-list");

    const couponCards =
        document.querySelectorAll(".coupon-card");

    const couponPrev =
        document.querySelector(".coupon-prev");

    const couponNext =
        document.querySelector(".coupon-next");


    let couponIndex = 0;


    /* 화면에 보이는 카드 수 */
    const visibleCouponCount = 4;



    /* ========================================
       COUPON CARD WIDTH
    ======================================== */

    function getCouponMoveWidth() {

        if (
            !couponList ||
            couponCards.length === 0
        ) {

            return 0;

        }


        const cardWidth =
            couponCards[0]
                .getBoundingClientRect()
                .width;


        const listStyle =
            window.getComputedStyle(
                couponList
            );


        const gap =
            parseFloat(
                listStyle.gap
            ) || 0;


        return cardWidth + gap;

    }



    /* ========================================
       COUPON MOVE
    ======================================== */

    function moveCouponSlide() {

        if (
            !couponList ||
            couponCards.length === 0
        ) {
            return;
        }


        const moveWidth =
            getCouponMoveWidth();


        couponList.style.transform =
            `translateX(-${moveWidth * couponIndex}px)`;


        const maxIndex =
            Math.max(
                0,
                couponCards.length -
                visibleCouponCount
            );



        /* 처음이면 왼쪽 버튼 숨김 */
        if (couponPrev) {

            if (
                couponIndex <= 0
            ) {

                couponPrev.style.display =
                    "none";

            } else {

                couponPrev.style.display =
                    "flex";

            }

        }



        /* 마지막이면 오른쪽 버튼 숨김 */
        if (couponNext) {

            if (
                couponIndex >=
                maxIndex
            ) {

                couponNext.style.display =
                    "none";

            } else {

                couponNext.style.display =
                    "flex";

            }

        }

    }



    /* ========================================
       COUPON NEXT
       한 칸 이동
    ======================================== */

    if (couponNext) {

        couponNext.addEventListener(
            "click",
            function () {

                const maxIndex =
                    Math.max(
                        0,
                        couponCards.length -
                        visibleCouponCount
                    );


                if (
                    couponIndex <
                    maxIndex
                ) {

                    couponIndex++;

                    moveCouponSlide();

                }

            }
        );

    }



    /* ========================================
       COUPON PREV
       한 칸 이동
    ======================================== */

    if (couponPrev) {

        couponPrev.addEventListener(
            "click",
            function () {

                if (
                    couponIndex > 0
                ) {

                    couponIndex--;

                    moveCouponSlide();

                }

            }
        );

    }



    /* 화면 크기 바뀌면 이동폭 재계산 */
    window.addEventListener(
        "resize",
        function () {

            moveCouponSlide();

        }
    );



    /* 쿠폰 처음 실행 */
    moveCouponSlide();





    /* ========================================
       HOT MENU TAB
    ======================================== */

    const hotTabs =
        document.querySelectorAll(
            ".hot-tabs button"
        );


    const hotPromoImage =
        document.querySelector(
            "#hotPromoImage"
        );


    const hotProductList =
        document.querySelector(
            "#hotProductList"
        );



    /* ========================================
       HOT MENU DATA
    ======================================== */

    const hotMenuData = {


        /* ========================================
           플레:이팅
        ======================================== */

        pleeating: {

            promo:
                "./images/imgi_25_hot_pleeating.png",

            products: [

                {
                    image:
                        "./images/imgi_26_x240.jpg",

                    name:
                        "[3] 흑미비빔밥",

                    price:
                        "11,000원"
                },

                {
                    image:
                        "./images/imgi_27_x240.jpg",

                    name:
                        "도가니탕",

                    price:
                        "15,000원"
                },

                {
                    image:
                        "./images/imgi_28_x240.jpg",

                    name:
                        "돈까스오므라이스",

                    price:
                        "11,000원"
                },

                {
                    image:
                        "./images/imgi_29_x240.jpg",

                    name:
                        "추억의 왕돈까스",

                    price:
                        "13,500원"
                },

                {
                    image:
                        "./images/imgi_30_x240.jpg",

                    name:
                        "열무비빔밥",

                    price:
                        "12,500원"
                }

            ]

        },



        /* ========================================
           크리스피크림 도넛
        ======================================== */

        krispy: {

            promo:
                "./images/imgi_17_hot_krispy.png",

            products: [

                {
                    image:
                        "./images/imgi_18_x240.png",

                    name:
                        "오리지널 글레이즈드",

                    price:
                        "2,200원"
                },

                {
                    image:
                        "./images/imgi_18_x240.png",

                    name:
                        "오리지널 글레이즈드 더즌",

                    price:
                        "19,000원"
                },

                {
                    image:
                        "./images/imgi_18_x240.png",

                    name:
                        "오리지널 글레이즈드 하프더즌",

                    price:
                        "11,000원"
                },

                {
                    image:
                        "./images/imgi_18_x240.png",

                    name:
                        "도넛 세트",

                    price:
                        "15,000원"
                },

                {
                    image:
                        "./images/imgi_18_x240.png",

                    name:
                        "크리스피크림 도넛",

                    price:
                        "2,800원"
                }

            ]

        },



        /* ========================================
           롯데리아
        ======================================== */

        lotteria: {

            promo:
                "./images/imgi_19_hot_lotteria.png",

            products: [

                {
                    image:
                        "./images/imgi_20_x240.png",

                    name:
                        "리아 새우",

                    price:
                        "5,000원"
                },

                {
                    image:
                        "./images/imgi_21_x240.png",

                    name:
                        "핫크리스피치킨버거",

                    price:
                        "6,900원"
                },

                {
                    image:
                        "./images/imgi_22_x240.png",

                    name:
                        "리아 불고기",

                    price:
                        "6,200원"
                },

                {
                    image:
                        "./images/imgi_23_x240.png",

                    name:
                        "양념감자",

                    price:
                        "2,500원"
                },

                {
                    image:
                        "./images/imgi_24_x240.png",

                    name:
                        "화이어윙",

                    price:
                        "3,400원"
                }

            ]

        },



        /* ========================================
           엔제리너스
        ======================================== */

        angelinus: {

            promo:
                "./images/imgi_11_hot_angelinus.png",

            products: [

                {
                    image:
                        "./images/imgi_12_x240.png",

                    name:
                        "텐션젤리에이드",

                    price:
                        "6,600원"
                },

                {
                    image:
                        "./images/imgi_13_x240.png",

                    name:
                        "텐션젤리아이스티",

                    price:
                        "5,500원"
                },

                {
                    image:
                        "./images/imgi_14_x240.png",

                    name:
                        "아메리카노",

                    price:
                        "4,700원"
                },

                {
                    image:
                        "./images/imgi_15_x240.png",

                    name:
                        "오리지널불고기",

                    price:
                        "7,600원"
                },

                {
                    image:
                        "./images/imgi_16_x240.png",

                    name:
                        "에그햄치즈오븐토스트",

                    price:
                        "5,200원"
                }

            ]

        }

    };



    /* ========================================
       HOT MENU RENDER
    ======================================== */

    function renderHotMenu(brand) {

        const data =
            hotMenuData[brand];


        if (!data) {

            return;

        }


        /* 왼쪽 프로모션 이미지 */
        if (hotPromoImage) {

            hotPromoImage.src =
                data.promo;

        }


        /* 상품 5개 */
        if (hotProductList) {

            hotProductList.innerHTML =
                data.products
                    .map(
                        function (product) {

                            return `

                                <article class="hot-product">

                                    <div class="hot-product-image">

                                        <img
                                            src="${product.image}"
                                            alt="${product.name}"
                                        >

                                    </div>


                                    <h3>
                                        ${product.name}
                                    </h3>


                                    <strong>
                                        ${product.price}
                                    </strong>

                                </article>

                            `;

                        }
                    )
                    .join("");

        }

    }



    /* ========================================
       HOT MENU TAB CLICK
    ======================================== */

    hotTabs.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {


                    /* 모든 탭 active 제거 */
                    hotTabs.forEach(
                        function (tab) {

                            tab.classList.remove(
                                "active"
                            );

                        }
                    );


                    /* 클릭 탭 active */
                    button.classList.add(
                        "active"
                    );


                    /* 해당 브랜드 표시 */
                    renderHotMenu(
                        button.dataset.brand
                    );

                }
            );

        }
    );


});


/* ========================================
   GNB 2DEPTH ACTIVE
   2단 메뉴에 마우스를 올리면
   해당 1단 메뉴에 색상 + 밑줄 표시
======================================== */

const depth1Links =
    document.querySelectorAll(
        ".gnb-depth1 > li > a"
    );


const depth2Menus =
    document.querySelectorAll(
        ".depth2-menu"
    );


const megaMenu =
    document.querySelector(
        ".mega-menu"
    );



/* ========================================
   1DEPTH ACTIVE 제거
======================================== */

function removeGnbActive() {

    depth1Links.forEach(
        function (link) {

            link.classList.remove(
                "is-active"
            );

        }
    );

}



/* ========================================
   2DEPTH 컬럼에 마우스 진입
======================================== */

depth2Menus.forEach(
    function (menu) {

        menu.addEventListener(
            "mouseenter",
            function () {


                /* 기존 active 제거 */
                removeGnbActive();


                /* 현재 2단 메뉴의 부모 이름 */
                const parentName =
                    menu.dataset.parent;


                /* 연결된 1단 메뉴 찾기 */
                const parentLink =
                    document.querySelector(
                        `.gnb-depth1 > li > a[data-menu="${parentName}"]`
                    );


                /* 1단 메뉴 active */
                if (parentLink) {

                    parentLink.classList.add(
                        "is-active"
                    );

                }

            }
        );

    }
);



/* ========================================
   MEGA MENU에서 완전히 벗어나면
   1DEPTH ACTIVE 제거
======================================== */

if (megaMenu) {

    megaMenu.addEventListener(
        "mouseleave",
        function () {

            removeGnbActive();

        }
    );

}
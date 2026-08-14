/* =========================
   STORE MAP DATA
========================= */

const storeData = [
    {
        name: "카페온24 강남역점",
        status: "영업중",
        address: "서울특별시 강남구 테헤란로 123 1층",
        hours: "24시간 연중무휴",
        phone: "02-1234-5678",
        lat: 37.498095,
        lng: 127.027610,
        detailUrl: "#"
    },
    {
        name: "카페온24 삼성역점",
        status: "영업중",
        address: "서울특별시 강남구 영동대로 456 1층",
        hours: "24시간 연중무휴",
        phone: "02-2345-6789",
        lat: 37.508856,
        lng: 127.063159,
        detailUrl: "#"
    },
    {
        name: "카페온24 잠실점",
        status: "영업중",
        address: "서울특별시 송파구 올림픽로 789 1층",
        hours: "24시간 연중무휴",
        phone: "02-3456-7890",
        lat: 37.513261,
        lng: 127.100133,
        detailUrl: "#"
    }
];


/* =========================
   STORE MAP
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const storeName = document.getElementById("storeName");
    const storeStatus = document.getElementById("storeStatus");
    const storeAddress = document.getElementById("storeAddress");
    const storeHours = document.getElementById("storeHours");
    const storePhone = document.getElementById("storePhone");
    const storeDetailBtn = document.getElementById("storeDetailBtn");
    const storeFindBtn = document.getElementById("storeFindBtn");

    const mapContainer = document.getElementById("storeMap");

    const mapOption = {
        center: new kakao.maps.LatLng(
            storeData[0].lat,
            storeData[0].lng
        ),
        level: 8
    };

    const map = new kakao.maps.Map(
        mapContainer,
        mapOption
    );

    let currentStoreIndex = 0;


    /* =========================
       STORE CARD UPDATE
    ========================= */

    function updateStoreCard(index) {

        const store = storeData[index];

        currentStoreIndex = index;

        storeName.textContent = store.name;
        storeStatus.textContent = store.status;
        storeAddress.textContent = store.address;
        storeHours.textContent = store.hours;
        storePhone.textContent = store.phone;

        storeDetailBtn.setAttribute(
            "href",
            store.detailUrl
        );

        const movePosition = new kakao.maps.LatLng(
            store.lat,
            store.lng
        );

        map.panTo(movePosition);
    }


    /* =========================
       STORE MARKERS
    ========================= */

    storeData.forEach(function (store, index) {

        const markerPosition = new kakao.maps.LatLng(
            store.lat,
            store.lng
        );

        const marker = new kakao.maps.Marker({
            position: markerPosition,
            title: store.name
        });

        marker.setMap(map);


        /* =========================
           MARKER CLICK
        ========================= */

        kakao.maps.event.addListener(
            marker,
            "click",
            function () {
                updateStoreCard(index);
            }
        );

    });


    /* =========================
       FIND STORE BUTTON
    ========================= */

    storeFindBtn.addEventListener(
        "click",
        function () {

            const store = storeData[currentStoreIndex];

            const movePosition = new kakao.maps.LatLng(
                store.lat,
                store.lng
            );

            map.panTo(movePosition);
        }
    );


    /* =========================
       FIRST STORE
    ========================= */

    updateStoreCard(0);

});
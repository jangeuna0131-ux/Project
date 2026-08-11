// ========================================
// ELEMENT
// ========================================

const header = document.querySelector(".header");

const modal = document.getElementById("leadModal");

const modalOverlay = document.querySelector(".modal-overlay");

const modalCloseButton =
    document.querySelector(".modal-close");

const openModalButtons =
    document.querySelectorAll(".open-modal");

const leadForm =
    document.getElementById("leadForm");

const formView =
    document.getElementById("formView");

const successView =
    document.getElementById("successView");

const successCloseButton =
    document.querySelector(".success-close");

const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");

const submitButton =
    document.getElementById("submitButton");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const userPhone =
    document.getElementById("userPhone");

const privacyAgree =
    document.getElementById("privacyAgree");

const privacyError =
    document.getElementById("privacyError");


// ========================================
// HEADER SCROLL
// ========================================

window.addEventListener("scroll", function () {

    if (window.scrollY > 30) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


// ========================================
// MODAL OPEN
// ========================================

openModalButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const modalType =
            button.dataset.modalType;

        openModal(modalType);

    });

});


function openModal(type) {

    resetModal();

    // 상담
    if (type === "consult") {

        modalTitle.innerHTML =
            "AI 업무 활용<br>상담 신청하기";

        modalDescription.textContent =
            "현재 업무에서 AI를 어떻게 활용할 수 있을지 간단한 정보를 남겨주시면 상담 안내를 전달해드립니다.";

        submitButton.innerHTML =
            "상담 신청하기 <span>→</span>";

    }

    // 가이드
    else {

        modalTitle.innerHTML =
            "AI 업무 활용<br>가이드 받아보기";

        modalDescription.textContent =
            "간단한 정보를 남겨주시면 실무에서 사용할 수 있는 AI 업무 활용 콘텐츠를 전달해드립니다.";

        submitButton.innerHTML =
            "가이드 신청하기 <span>→</span>";

    }


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );


    // 팝업을 열면 이름 입력칸에 포커스
    setTimeout(function () {

        userName.focus();

    }, 150);

}


// ========================================
// MODAL CLOSE
// ========================================

function closeModal() {

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


modalCloseButton.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    closeModal
);


successCloseButton.addEventListener(
    "click",
    closeModal
);


// ESC 키
document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {

            closeModal();

        }

    }
);


// ========================================
// PHONE AUTO FORMAT
// ========================================

userPhone.addEventListener(
    "input",
    function () {

        let value =
            this.value.replace(/\D/g, "");

        if (value.length > 11) {
            value = value.slice(0, 11);
        }


        if (value.length <= 3) {

            this.value = value;

        }

        else if (value.length <= 7) {

            this.value =
                value.slice(0, 3) +
                "-" +
                value.slice(3);

        }

        else {

            this.value =
                value.slice(0, 3) +
                "-" +
                value.slice(3, 7) +
                "-" +
                value.slice(7);

        }

    }
);


// ========================================
// VALIDATION
// ========================================

function showError(
    input,
    message
) {

    const formGroup =
        input.closest(".form-group");

    formGroup.classList.add("error");

    const errorMessage =
        formGroup.querySelector(
            ".error-message"
        );

    errorMessage.textContent =
        message;

}


function clearError(input) {

    const formGroup =
        input.closest(".form-group");

    formGroup.classList.remove("error");

    const errorMessage =
        formGroup.querySelector(
            ".error-message"
        );

    errorMessage.textContent = "";

}


// 이메일 검사
function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}


// 전화번호 검사
function isValidPhone(phone) {

    const onlyNumber =
        phone.replace(/\D/g, "");

    return /^01[016789]\d{7,8}$/.test(
        onlyNumber
    );

}


// ========================================
// FORM SUBMIT
// ========================================

leadForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        let isValid = true;


        // 이름
        if (
            userName.value.trim() === ""
        ) {

            showError(
                userName,
                "이름을 입력해주세요."
            );

            isValid = false;

        } else {

            clearError(userName);

        }


        // 이메일
        if (
            userEmail.value.trim() === ""
        ) {

            showError(
                userEmail,
                "이메일 주소를 입력해주세요."
            );

            isValid = false;

        }

        else if (
            !isValidEmail(
                userEmail.value.trim()
            )
        ) {

            showError(
                userEmail,
                "올바른 이메일 주소를 입력해주세요."
            );

            isValid = false;

        }

        else {

            clearError(userEmail);

        }


        // 전화번호
        if (
            userPhone.value.trim() === ""
        ) {

            showError(
                userPhone,
                "전화번호를 입력해주세요."
            );

            isValid = false;

        }

        else if (
            !isValidPhone(
                userPhone.value
            )
        ) {

            showError(
                userPhone,
                "올바른 전화번호를 입력해주세요."
            );

            isValid = false;

        }

        else {

            clearError(userPhone);

        }


        // 개인정보 동의
        if (!privacyAgree.checked) {

            privacyError.textContent =
                "개인정보 수집 및 이용에 동의해주세요.";

            isValid = false;

        }

        else {

            privacyError.textContent = "";

        }


        // 실패
        if (!isValid) {
            return;
        }


        // ========================================
        // 실제 서버가 없는 데모이므로
        // 성공 화면으로 변경
        // ========================================

        const formData = {

            name:
                userName.value.trim(),

            email:
                userEmail.value.trim(),

            phone:
                userPhone.value.trim(),

            marketing:
                document
                    .getElementById(
                        "marketingAgree"
                    )
                    .checked

        };


        console.log(
            "Lead Data:",
            formData
        );


        formView.hidden = true;

        successView.hidden = false;

    }
);


// ========================================
// INPUT 입력 시작하면 에러 제거
// ========================================

[
    userName,
    userEmail,
    userPhone
].forEach(function (input) {

    input.addEventListener(
        "input",
        function () {

            clearError(input);

        }
    );

});


privacyAgree.addEventListener(
    "change",
    function () {

        if (privacyAgree.checked) {

            privacyError.textContent = "";

        }

    }
);


// ========================================
// MODAL RESET
// ========================================

function resetModal() {

    leadForm.reset();

    formView.hidden = false;

    successView.hidden = true;


    [
        userName,
        userEmail,
        userPhone
    ].forEach(function (input) {

        clearError(input);

    });


    privacyError.textContent = "";

}


// ========================================
// SMOOTH SCROLL
// ========================================

const internalLinks =
    document.querySelectorAll(
        'a[href^="#"]'
    );


internalLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute(
                        "href"
                    );


                if (
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                const headerHeight =
                    header.offsetHeight;


                const targetPosition =
                    target
                        .getBoundingClientRect()
                        .top
                    +
                    window.scrollY
                    -
                    headerHeight;


                window.scrollTo({

                    top:
                        targetPosition,

                    behavior:
                        "smooth"

                });

            }
        );

    }
);


// ========================================
// INTERSECTION ANIMATION
// ========================================

const animationTargets =
    document.querySelectorAll(
        `
        .problem-card,
        .step,
        .case-card,
        .resource-card,
        .human-ai-card
        `
    );


animationTargets.forEach(
    function (target) {

        target.style.opacity = "0";

        target.style.transform =
            "translateY(24px)";

        target.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

    }
);


const observer =
    new IntersectionObserver(

        function (entries) {

            entries.forEach(
                function (entry) {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";

                        observer.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },

        {
            threshold: 0.12
        }

    );


animationTargets.forEach(
    function (target) {

        observer.observe(target);

    }
);
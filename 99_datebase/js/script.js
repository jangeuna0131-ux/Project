const scriptURL =
"https://script.google.com/macros/s/AKfycbyLst13lr4QS8D0CbJPQx2VH9ksuago-UVddkwLsJDoh_3YpDoq4E8fKkBesqms-KuY5Q/exec";

const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");

form.addEventListener("submit", function(e) {

    e.preventDefault();

    msg.innerHTML = "전송 중...";

    fetch(scriptURL, {
        method: "POST",
        body: new FormData(form)
    })

    .then(function(response) {

        msg.innerHTML = "Message sent successfully";

        form.reset();

        setTimeout(function() {
            msg.innerHTML = "";
        }, 5000);

    })

    .catch(function(error) {

        console.error("Error!", error);

        msg.innerHTML = "전송 실패";

    });

});
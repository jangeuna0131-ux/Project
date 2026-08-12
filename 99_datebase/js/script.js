const scriptURL =
"https://script.google.com/macros/s/AKfycbyL1pHDWBmhZ2qTJP-uwDdI6nFMw5qdN_mBufgF5OmX/dev";

const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    fetch(scriptURL, {
        method: "POST",
        body: new FormData(form)
    })

    .then((response) => {

        msg.innerHTML = "Message sent successfully";

        setTimeout(function () {
            msg.innerHTML = "";
        }, 5000);

        form.reset();

    })

    .catch((error) => {

        console.error("Error!", error.message);

    });

});
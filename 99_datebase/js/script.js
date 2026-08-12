<form name="submit-to-google-sheet">

    <input
        type="text"
        name="name"
        placeholder="이름"
        required
    >

    <input
        type="email"
        name="email"
        placeholder="이메일"
        required
    >

    <button type="submit">
        보내기
    </button>

    <span id="msg"></span>

</form>

<script>
const scriptURL =
"https://script.google.com/macros/s/AKfycbyLst13lr4QS8D0CbJPQx2VH9ksuago-UVddkwLsJDoh_3YpDoq4E8fKkBesqms-KuY5Q/exec";

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
</script>
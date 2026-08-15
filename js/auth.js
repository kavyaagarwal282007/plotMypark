const loginForm = document.getElementById("loginForm");
const demoLogin = document.getElementById("demoLogin");


loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter your login details.");
        return;
    }

    // Temporary frontend login
    // Later this will connect to Pranjal's backend API.

    localStorage.setItem("plotMyparkUser", email);

    window.location.href = "home.html";
});


demoLogin.addEventListener("click", function () {

    localStorage.setItem(
        "plotMyparkUser",
        "demo@plotmypark.com"
    );

    window.location.href = "home.html";
});
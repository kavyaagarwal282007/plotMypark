/* =========================
   REGISTER PAGE
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        // Temporary frontend registration
        localStorage.setItem("plotMyParkUser", JSON.stringify({
            name: name,
            email: email,
            phone: phone
        }));

        alert("Account created successfully!");

        window.location.href = "index.html";
    });
}
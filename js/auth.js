```javascript
const loginForm = document.getElementById("loginForm");
const demoLogin = document.getElementById("demoLogin");


/* =========================
   NORMAL LOGIN
========================= */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();


    if (email === "" || password === "") {

        alert("Please enter your login details.");

        return;
    }


    /*
        Check if a registered user already exists.
        The registration page stores the complete
        user object in localStorage.
    */

    const registeredUser =
        localStorage.getItem("plotMyParkUser");


    if (registeredUser) {

        try {

            const user =
                JSON.parse(registeredUser);


            /*
                Keep the registered user's name,
                email and phone.

                We only update the login email
                if necessary.
            */

            if (
                user.email &&
                user.email.toLowerCase() === email.toLowerCase()
            ) {

                localStorage.setItem(
                    "plotMyParkUser",
                    JSON.stringify(user)
                );

            } else {

                /*
                    If this is a different login,
                    save the entered email but keep
                    a readable name.
                */

                const loginUser = {

                    name: email.includes("@")
                        ? email.split("@")[0]
                        : email,

                    email: email,

                    phone: user.phone || ""

                };

                localStorage.setItem(
                    "plotMyParkUser",
                    JSON.stringify(loginUser)
                );
            }


        } catch (error) {

            /*
                If old data is just a plain email,
                convert it into a user object.
            */

            const loginUser = {

                name: email.includes("@")
                    ? email.split("@")[0]
                    : email,

                email: email,

                phone: ""

            };

            localStorage.setItem(
                "plotMyParkUser",
                JSON.stringify(loginUser)
            );
        }


    } else {

        /*
            No registered account found.
            Create a temporary login user.
        */

        const loginUser = {

            name: email.includes("@")
                ? email.split("@")[0]
                : email,

            email: email,

            phone: ""

        };

        localStorage.setItem(
            "plotMyParkUser",
            JSON.stringify(loginUser)
        );
    }


    window.location.href = "home.html";

});



/* =========================
   DEMO LOGIN
========================= */

demoLogin.addEventListener("click", function () {

    const demoUser = {

        name: "Demo User",

        email: "demo@plotmypark.com",

        phone: "+91 XXXXX XXXXX"

    };


    localStorage.setItem(
        "plotMyParkUser",
        JSON.stringify(demoUser)
    );


    window.location.href = "home.html";

});
```

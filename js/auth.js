const loginForm = document.getElementById("loginForm");
const demoLogin = document.getElementById("demoLogin");


/* =========================
   NORMAL LOGIN
========================= */

if (loginForm) {

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
            Get registered user
        */

        const savedUser =
            localStorage.getItem("plotMyParkUser");


        if (savedUser) {

            try {

                const user =
                    JSON.parse(savedUser);


                /*
                    If registered email matches,
                    keep the registered name.
                */

                if (
                    user.email &&
                    user.email.toLowerCase() ===
                    email.toLowerCase()
                ) {

                    localStorage.setItem(
                        "plotMyParkUser",
                        JSON.stringify(user)
                    );

                } else {

                    /*
                        Login with another email
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

            } catch (error) {

                /*
                    Old localStorage data
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
                No registered user
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


        /* GO TO HOME */

        window.location.href = "home.html";

    });

}



/* =========================
   DEMO LOGIN
========================= */

if (demoLogin) {

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


        /* GO TO HOME */

        window.location.href = "home.html";

    });

}
document.addEventListener("DOMContentLoaded", function () {


    /* ELEMENTS */

    const nameInput =
        document.getElementById("nameInput");

    const emailInput =
        document.getElementById("emailInput");

    const phoneInput =
        document.getElementById("phoneInput");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const profileActions =
        document.getElementById("profileActions");

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");

    const cancelEditBtn =
        document.getElementById("cancelEditBtn");

    const profileSpace =
        document.getElementById("profileSpace");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const profileMessage =
        document.getElementById("profileMessage");


    /* LOAD OWNER DATA */

    const savedSpace =
        localStorage.getItem("ownerSpace");


    let space = savedSpace
        ? JSON.parse(savedSpace)
        : null;


    let ownerName =
        localStorage.getItem("ownerName")
        || (space ? space.ownerName : "")
        || "Parking Owner";


    let ownerEmail =
        localStorage.getItem("ownerEmail")
        || (space ? space.ownerEmail : "")
        || "";


    let ownerPhone =
        localStorage.getItem("ownerPhone")
        || (space ? space.ownerPhone : "")
        || "";


    /* DISPLAY */

    function loadProfile() {

        nameInput.value =
            ownerName;

        emailInput.value =
            ownerEmail;

        phoneInput.value =
            ownerPhone;


        profileName.textContent =
            ownerName || "Parking Owner";


        profileEmail.textContent =
            ownerEmail || "No email added";


        loadSpace();

    }


    /* PARKING SPACE */

    function loadSpace() {

        if (!space) {

            profileSpace.innerHTML = `

                <div class="profile-no-space">

                    <span>
                        🅿️
                    </span>

                    <p>
                        No parking space registered.
                    </p>

                    <button
                        onclick="window.location.href='owner-register.html'"
                        class="add-space-btn"
                    >
                        + Register Space
                    </button>

                </div>

            `;

            return;
        }


        profileSpace.innerHTML = `

            <div class="profile-space">

                <div class="profile-space-icon">
                    🅿️
                </div>

                <div>

                    <strong>
                        ${space.spaceName}
                    </strong>

                    <small>
                        📍 ${space.city}
                    </small>

                    <small>
                        Capacity:
                        ${space.capacity} vehicles
                    </small>

                </div>

            </div>

        `;

    }


    /* EDIT */

    editProfileBtn.addEventListener(
        "click",
        function () {

            nameInput.disabled =
                false;

            emailInput.disabled =
                false;

            phoneInput.disabled =
                false;


            editProfileBtn.style.display =
                "none";

            profileActions.style.display =
                "flex";

            nameInput.focus();

        }
    );


    /* CANCEL */

    cancelEditBtn.addEventListener(
        "click",
        function () {

            loadProfile();

            disableEditing();

        }
    );


    /* SAVE */

    saveProfileBtn.addEventListener(
        "click",
        function () {

            ownerName =
                nameInput.value.trim();

            ownerEmail =
                emailInput.value.trim();

            ownerPhone =
                phoneInput.value.trim();


            if (!ownerName) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            /* SAVE OWNER */

            localStorage.setItem(
                "ownerName",
                ownerName
            );

            localStorage.setItem(
                "ownerEmail",
                ownerEmail
            );

            localStorage.setItem(
                "ownerPhone",
                ownerPhone
            );


            /* UPDATE SPACE */

            if (space) {

                space.ownerName =
                    ownerName;

                space.ownerEmail =
                    ownerEmail;

                space.ownerPhone =
                    ownerPhone;


                localStorage.setItem(
                    "ownerSpace",
                    JSON.stringify(space)
                );

            }


            profileName.textContent =
                ownerName;

            profileEmail.textContent =
                ownerEmail;


            disableEditing();


            showMessage(
                "Profile updated successfully."
            );

        }
    );


    /* DISABLE EDITING */

    function disableEditing() {

        nameInput.disabled =
            true;

        emailInput.disabled =
            true;

        phoneInput.disabled =
            true;


        editProfileBtn.style.display =
            "block";

        profileActions.style.display =
            "none";

    }


    /* MESSAGE */

    function showMessage(message) {

        profileMessage.textContent =
            "✓ " + message;


        setTimeout(
            function () {

                profileMessage.textContent =
                    "";

            },
            2500
        );

    }


    /* LOGOUT */

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmLogout) {
                return;
            }


            /*
               For now we only remove
               the demo owner session.
               
               We KEEP ownerSpace because
               this is demo data.
            */

            localStorage.removeItem(
                "ownerName"
            );

            localStorage.removeItem(
                "ownerEmail"
            );

            localStorage.removeItem(
                "ownerPhone"
            );


            window.location.href =
                "index.html";

        }
    );


    /* INITIALIZE */

    loadProfile();

    disableEditing();

});
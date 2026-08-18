/* =========================================================
   PLOT MYPARK - APP.JS
   ========================================================= */


/* =========================================================
   PARKING DATA
   ========================================================= */

const parkingData = [
    {
        name: "Mall Road Parking",
        distance: "450 m",
        price: "₹20/hr",
        available: 8
    },
    {
        name: "Civil Lines Parking",
        distance: "800 m",
        price: "₹15/hr",
        available: 5
    },
    {
        name: "Naveen Market Parking",
        distance: "1.2 km",
        price: "₹20/hr",
        available: 3
    },
    {
        name: "Swaroop Nagar Parking",
        distance: "1.5 km",
        price: "₹25/hr",
        available: 7
    }
];


/* =========================================================
   DISPLAY PARKING
   ========================================================= */

const parkingList = document.getElementById("parkingList");


function displayParking(data) {

    if (!parkingList) return;

    parkingList.innerHTML = "";

    if (data.length === 0) {

        parkingList.innerHTML = `
            <div class="empty-bookings">
                <span>🔍</span>
                <p>No parking found</p>
                <small>
                    Try searching for another location.
                </small>
            </div>
        `;

        return;
    }


    data.forEach(parking => {

        const card = document.createElement("div");

        card.className = "parking-card";


        card.innerHTML = `

            <div>

                <h3>
                    ${parking.name}
                </h3>

                <p>
                    📍 ${parking.distance}
                </p>

                <p>
                    💰 ${parking.price}
                </p>

            </div>


            <span class="available-badge">

                🟢 ${parking.available} available

            </span>

        `;


        parkingList.appendChild(card);

    });

}


/* =========================================================
   INITIAL PARKING DISPLAY
   ========================================================= */

displayParking(parkingData);



/* =========================================================
   PARKING SEARCH
   ========================================================= */

const searchInput =
    document.getElementById("parkingSearch");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filteredParking =
                parkingData.filter(
                    parking =>
                        parking.name
                            .toLowerCase()
                            .includes(searchValue)
                );


            displayParking(filteredParking);

        }
    );

}



/* =========================================================
   NAVIGATION
   ========================================================= */

function goToParking() {

    window.location.href = "parking.html";

}


function activateNavAndNavigate(
    button,
    targetPage
) {

    const navButtons =
        document.querySelectorAll(
            ".bottom-item"
        );


    navButtons.forEach(item => {

        item.classList.remove("active");

    });


    if (button) {

        button.classList.add("active");

    }


    setTimeout(
        function () {

            window.location.href =
                targetPage;

        },
        150
    );

}



function goToHistory() {

    const historyButton =
        document.querySelector(
            ".bottom-item:nth-of-type(3)"
        );


    activateNavAndNavigate(
        historyButton,
        "history.html"
    );

}



function viewParkingDetails() {

    alert(
        "Parking details will open here."
    );

}



/* =========================================================
   USER NAME + TIME-BASED GREETING
   ========================================================= */

const savedUser =
    localStorage.getItem(
        "plotMyparkUser"
    );


const userNameElement =
    document.getElementById(
        "userName"
    );


if (savedUser && userNameElement) {

    let userName = "Driver";


    /*
       New registration stores:
       {
           name,
           email,
           phone
       }

       Older login may store only
       the email string.
    */

    try {

        const parsedUser =
            JSON.parse(savedUser);


        if (
            parsedUser &&
            parsedUser.name
        ) {

            userName =
                parsedUser.name;

        } else if (
            parsedUser &&
            parsedUser.email
        ) {

            userName =
                parsedUser.email
                    .split("@")[0];

        }

    } catch (error) {

        /*
           If localStorage contains
           an old plain email/string.
        */

        if (
            savedUser.includes("@")
        ) {

            userName =
                savedUser
                    .split("@")[0];

        } else {

            userName =
                savedUser;

        }

    }


    userNameElement.textContent =
        userName;

}



/* =========================================================
   TIME-BASED GREETING
   ========================================================= */

function updateGreeting() {

    const greetingElement =
        document.querySelector(
            ".welcome-content h1"
        );


    if (!greetingElement) return;


    const hour =
        new Date().getHours();


    let greeting =
        "Good evening";


    if (hour >= 5 && hour < 12) {

        greeting =
            "Good morning";

    } else if (
        hour >= 12 &&
        hour < 17
    ) {

        greeting =
            "Good afternoon";

    } else if (
        hour >= 17 &&
        hour < 21
    ) {

        greeting =
            "Good evening";

    } else {

        greeting =
            "Good night";

    }


    /*
       Replace only the greeting text
       while keeping the user's name
       and emoji intact.
    */

    const name =
        userNameElement
            ? userNameElement.textContent
            : "Driver";


    greetingElement.innerHTML = `

        ${greeting},

        <span id="userName">
            ${name}
        </span>

        👋

    `;

}


updateGreeting();



/* =========================================================
   KEEP GREETING UPDATED
   ========================================================= */

setInterval(
    updateGreeting,
    60000
);
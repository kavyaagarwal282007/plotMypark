/* =========================
   PARKING DATA
========================= */

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


const parkingList =
    document.getElementById("parkingList");


/* =========================
   DISPLAY PARKING
========================= */

function displayParking(data) {

    if (!parkingList) return;

    parkingList.innerHTML = "";

    data.forEach(parking => {

        const card =
            document.createElement("div");

        card.className = "parking-card";

        card.innerHTML = `
            <div>
                <h3>${parking.name}</h3>

                <p>📍 ${parking.distance}</p>

                <p>💰 ${parking.price}</p>
            </div>

            <span class="available-badge">
                🟢 ${parking.available} available
            </span>
        `;

        parkingList.appendChild(card);

    });
}


if (parkingList) {
    displayParking(parkingData);
}



/* =========================
   SEARCH
========================= */

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
                parkingData.filter(parking =>
                    parking.name
                        .toLowerCase()
                        .includes(searchValue)
                );


            displayParking(filteredParking);

        }
    );

}



/* =========================
   NAVIGATION
========================= */

function goToParking() {

    window.location.href =
        "parking.html";

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

        item.classList.remove(
            "active"
        );

    });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    setTimeout(() => {

        window.location.href =
            targetPage;

    }, 150);

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



/* =========================
   USER NAME + GREETING
========================= */

function loadUserGreeting() {

    const userNameElement =
        document.getElementById(
            "userName"
        );


    if (!userNameElement) return;


    const savedUser =
        localStorage.getItem(
            "plotMyParkUser"
        );


    let name = "Driver";


    if (savedUser) {

        try {

            /*
                New registered-user format:

                {
                    name: "Kavya Agarwal",
                    email: "...",
                    phone: "..."
                }
            */

            const user =
                JSON.parse(savedUser);


            if (
                user &&
                user.name &&
                user.name.trim() !== ""
            ) {

                name =
                    user.name.trim();

            }

        } catch (error) {

            /*
                Support old data where
                only an email was stored.
            */

            if (
                savedUser.includes("@")
            ) {

                name =
                    savedUser
                        .split("@")[0];

            } else {

                name =
                    savedUser;

            }

        }

    }


    /* =========================
       TIME BASED GREETING
    ========================= */

    const currentHour =
        new Date().getHours();


    let greeting;


    if (currentHour < 12) {

        greeting = "Good morning";

    } else if (currentHour < 17) {

        greeting = "Good afternoon";

    } else {

        greeting = "Good evening";

    }


    /*
        Find the existing h1
        and replace only the greeting.
    */

    const heading =
        userNameElement.parentElement
            ?.querySelector("h1");


    if (heading) {

        heading.innerHTML =
            `${greeting}, <span id="userName">${name}</span> 👋`;

    } else {

        userNameElement.textContent =
            name;

    }

}



/* =========================
   LOAD USER
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUserGreeting();

    }
);
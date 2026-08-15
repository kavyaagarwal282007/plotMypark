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


const parkingList = document.getElementById("parkingList");


function displayParking(data) {

    parkingList.innerHTML = "";

    data.forEach(parking => {

        const card = document.createElement("div");

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


displayParking(parkingData);


/* SEARCH */

const searchInput = document.getElementById("parkingSearch");

searchInput.addEventListener("input", function () {

    const searchValue =
        searchInput.value.toLowerCase().trim();

    const filteredParking =
        parkingData.filter(parking =>
            parking.name
                .toLowerCase()
                .includes(searchValue)
        );

    displayParking(filteredParking);
});


/* NAVIGATION */

function goToParking() {

   window.location.href = "parking.html";

    // Later:
    // window.location.href = "parking.html";
}


function activateNavAndNavigate(button, targetPage) {

    const navButtons = document.querySelectorAll(".bottom-item");

    navButtons.forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    setTimeout(() => {
        window.location.href = targetPage;
    }, 150);
}


function goToHistory() {
    const historyButton = document.querySelector(".bottom-item:nth-of-type(3)");
    activateNavAndNavigate(historyButton, "history.html");
}


function viewParkingDetails() {

    alert("Parking details will open here.");

    // Later:
    // window.location.href = "details.html";
}


/* USER */

const savedUser =
    localStorage.getItem("plotMyparkUser");

if (savedUser) {

    const userName =
        document.getElementById("userName");

    if (savedUser.includes("@")) {

        userName.textContent =
            savedUser.split("@")[0];

    } else {

        userName.textContent =
            savedUser;

    }
}
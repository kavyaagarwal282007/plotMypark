const parkingSpots =
    document.querySelectorAll(".parking-spot");

const selectedParking =
    document.getElementById("selectedParking");

const selectedName =
    document.getElementById("selectedName");

const selectedStatus =
    document.getElementById("selectedStatus");

const detailsButton =
    document.getElementById("detailsButton");


let selectedSpot = null;


parkingSpots.forEach(spot => {

    spot.addEventListener("click", function () {

        const id = this.dataset.id;
        const status = this.dataset.status;

        selectedSpot = id;

        selectedName.textContent =
            `Parking ${id}`;

        if (status === "AVAILABLE") {

            selectedStatus.textContent =
                "🟢 Available";

            detailsButton.disabled = false;

        }

        else if (status === "OCCUPIED") {

            selectedStatus.textContent =
                "🔴 Occupied";

            detailsButton.disabled = true;

        }

        else if (status === "RESERVED") {

            selectedStatus.textContent =
                "🔵 Reserved";

            detailsButton.disabled = true;

        }

        selectedParking.classList.remove("hidden");

    });

});


detailsButton.addEventListener("click", function () {

    if (!selectedSpot) return;

    localStorage.setItem(
        "selectedParking",
        selectedSpot
    );

    window.location.href =
        "details.html";

});
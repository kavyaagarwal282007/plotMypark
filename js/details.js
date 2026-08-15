const selectedParking =
    localStorage.getItem("selectedParking");

const parkingTitle =
    document.getElementById("parkingTitle");

const spaceName =
    document.getElementById("spaceName");

const reserveButton =
    document.getElementById("reserveButton");


if (selectedParking) {

    parkingTitle.textContent =
        `Parking ${selectedParking}`;

    spaceName.textContent =
        `Parking Space ${selectedParking}`;

}


reserveButton.addEventListener("click", function () {

    if (!selectedParking) {
        alert("Please select a parking space first.");
        return;
    }

    localStorage.setItem(
        "reservedParking",
        selectedParking
    );

    window.location.href =
        "reservation.html";

});
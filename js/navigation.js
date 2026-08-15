const reservedParking =
    localStorage.getItem("reservedParking");

const destinationName =
    document.getElementById("destinationName");

const arrivalButton =
    document.getElementById("arrivalButton");


if (reservedParking) {

    destinationName.textContent =
        `Parking ${reservedParking}`;

}


/*
    SIH DEMO:
    Simulate the vehicle reaching
    the reserved parking space.
*/

arrivalButton.addEventListener("click", function () {

    const confirmArrival = confirm(
        "Simulate arrival at the parking space?"
    );

    if (!confirmArrival) return;


    // Change parking state for our prototype
    localStorage.setItem(
        "parkingStatus",
        "OCCUPIED"
    );


    alert(
        `You have arrived at Parking ${reservedParking || ""}. Parking status is now OCCUPIED.`
    );


    window.location.href =
        "history.html";

});
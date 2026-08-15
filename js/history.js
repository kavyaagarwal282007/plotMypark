const reservedParking =
    localStorage.getItem("reservedParking");

const historyParking =
    document.getElementById("historyParking");

const bookingId =
    localStorage.getItem("plotMyparkBookingId");


if (reservedParking) {

    historyParking.textContent =
        `Parking ${reservedParking}`;

}


/*
    If there is no current demo booking,
    we can still show the older demo history.
*/

if (!reservedParking && !bookingId) {

    console.log("Showing previous parking history.");

}
const reservedParking =
    localStorage.getItem("reservedParking");

const reservationSpot =
    document.getElementById("reservationSpot");

const bookingId =
    document.getElementById("bookingId");

const countdown =
    document.getElementById("countdown");

const cancelButton =
    document.getElementById("cancelButton");

const navigationButton =
    document.getElementById("navigationButton");


/* PARKING SPACE */

if (reservedParking) {

    reservationSpot.textContent =
        `Parking ${reservedParking}`;

}


/* BOOKING ID */

const generatedBookingId =
    "PM-" +
    Math.floor(100000 + Math.random() * 900000);

bookingId.textContent =
    generatedBookingId;


/* SAVE BOOKING */

localStorage.setItem(
    "plotMyparkBookingId",
    generatedBookingId
);


/* 10 MINUTE TIMER */

let timeLeft = 10 * 60;

const timer = setInterval(() => {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    countdown.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (timeLeft <= 0) {

        clearInterval(timer);

        countdown.textContent =
            "EXPIRED";

        localStorage.removeItem(
            "reservedParking"
        );

        alert(
            "Your parking reservation has expired."
        );

        window.location.href =
            "parking.html";
    }

    timeLeft--;

}, 1000);


/* NAVIGATION */

navigationButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "navigation.html";

    }
);


/* CANCEL */

cancelButton.addEventListener(
    "click",
    function () {

        const confirmCancel =
            confirm(
                "Are you sure you want to cancel this reservation?"
            );

        if (!confirmCancel) return;

        clearInterval(timer);

        localStorage.removeItem(
            "reservedParking"
        );

        localStorage.removeItem(
            "plotMyparkBookingId"
        );

        window.location.href =
            "parking.html";

    }
);
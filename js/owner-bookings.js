document.addEventListener("DOMContentLoaded", function () {

    const savedSpace =
        localStorage.getItem("ownerSpace");


    const parkingName =
        document.getElementById("parkingName");


    const parkingLocation =
        document.getElementById("parkingLocation");


    const bookingList =
        document.getElementById("bookingList");


    const emptyBooking =
        document.getElementById("emptyBooking");


    const todayBookingCount =
        document.getElementById("todayBookingCount");


    /*
       LOAD PARKING
    */

    if (savedSpace) {

        const space =
            JSON.parse(savedSpace);


        parkingName.textContent =
            space.spaceName || "Parking Space";


        parkingLocation.textContent =
            "📍 " + (space.city || "Location");

    }


    /*
       DEMO BOOKINGS

       These are temporary.
       Later Pranjal's API/database
       will provide the real bookings.
    */

    let bookings =
        JSON.parse(
            localStorage.getItem("ownerBookings")
        );


    /*
       CREATE DEMO DATA ONLY
       IF NO BOOKINGS EXIST
    */

    if (!bookings) {

        bookings = [

            {
                id: "PM001",
                driver: "Rahul Sharma",
                vehicle: "UP78 AB 1234",
                date: "17 Aug 2026",
                time: "10:30 AM - 12:30 PM",
                duration: "2 hours",
                amount: 40,
                status: "upcoming"
            },

            {
                id: "PM002",
                driver: "Aman Verma",
                vehicle: "UP78 CD 5678",
                date: "17 Aug 2026",
                time: "12:00 PM - 01:00 PM",
                duration: "1 hour",
                amount: 20,
                status: "active"
            },

            {
                id: "PM003",
                driver: "Priya Singh",
                vehicle: "UP78 EF 9012",
                date: "16 Aug 2026",
                time: "05:00 PM - 07:00 PM",
                duration: "2 hours",
                amount: 40,
                status: "completed"
            }

        ];


        localStorage.setItem(
            "ownerBookings",
            JSON.stringify(bookings)
        );

    }


    /*
       TODAY'S BOOKINGS
    */

    const todayBookings =
        bookings.filter(function (booking) {

            return booking.date === "17 Aug 2026";

        });


    todayBookingCount.textContent =
        todayBookings.length;


    /*
       DISPLAY BOOKINGS
    */

    function displayBookings(filter = "all") {

        bookingList.innerHTML = "";


        let filteredBookings =
            bookings;


        if (filter !== "all") {

            filteredBookings =
                bookings.filter(function (booking) {

                    return booking.status === filter;

                });

        }


        if (filteredBookings.length === 0) {

            emptyBooking.style.display =
                "block";

            return;

        }


        emptyBooking.style.display =
            "none";


        filteredBookings.forEach(function (booking) {

            const card =
                document.createElement("div");


            card.className =
                "owner-booking-card";


            let statusText =
                booking.status
                    .charAt(0)
                    .toUpperCase()
                +
                booking.status.slice(1);


            card.innerHTML = `

                <div class="booking-card-header">

                    <div class="driver-info">

                        <div class="driver-avatar">
                            ${booking.driver.charAt(0)}
                        </div>

                        <div>

                            <strong>
                                ${booking.driver}
                            </strong>

                            <small>
                                Booking #${booking.id}
                            </small>

                        </div>

                    </div>


                    <span
                        class="booking-status status-${booking.status}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div class="booking-details">

                    <div>

                        <span>🚗</span>

                        <div>
                            <small>Vehicle</small>
                            <strong>
                                ${booking.vehicle}
                            </strong>
                        </div>

                    </div>


                    <div>

                        <span>📅</span>

                        <div>
                            <small>Date</small>
                            <strong>
                                ${booking.date}
                            </strong>
                        </div>

                    </div>


                    <div>

                        <span>🕐</span>

                        <div>
                            <small>Time</small>
                            <strong>
                                ${booking.time}
                            </strong>
                        </div>

                    </div>


                    <div>

                        <span>💰</span>

                        <div>
                            <small>Amount</small>
                            <strong>
                                ₹${booking.amount}
                            </strong>
                        </div>

                    </div>

                </div>


                ${
                    booking.status === "upcoming"
                    ?
                    `
                    <div class="booking-actions">

                        <button
                            class="confirm-btn"
                            onclick="confirmBooking('${booking.id}')"
                        >
                            ✓ Confirm
                        </button>

                        <button
                            class="cancel-booking-btn"
                            onclick="cancelBooking('${booking.id}')"
                        >
                            Cancel
                        </button>

                    </div>
                    `
                    :
                    ""
                }


                ${
                    booking.status === "active"
                    ?
                    `
                    <div class="active-booking-message">
                        🚗 Driver is currently using this parking space.
                    </div>
                    `
                    :
                    ""
                }

            `;


            bookingList.appendChild(card);

        });

    }


    /*
       FILTER BUTTONS
    */

    const filterButtons =
        document.querySelectorAll(
            ".booking-filter"
        );


    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                displayBookings(
                    button.dataset.filter
                );

            }
        );

    });


    /*
       INITIAL DISPLAY
    */

    displayBookings();


    /*
       CONFIRM BOOKING
    */

    window.confirmBooking =
        function (id) {

            const booking =
                bookings.find(
                    function (item) {

                        return item.id === id;

                    }
                );


            if (!booking) return;


            booking.status =
                "active";


            localStorage.setItem(
                "ownerBookings",
                JSON.stringify(bookings)
            );


            displayBookings();


            alert(
                "Booking confirmed successfully."
            );

        };


    /*
       CANCEL BOOKING
    */

    window.cancelBooking =
        function (id) {

            const booking =
                bookings.find(
                    function (item) {

                        return item.id === id;

                    }
                );


            if (!booking) return;


            const confirmCancel =
                confirm(
                    "Are you sure you want to cancel this booking?"
                );


            if (!confirmCancel) return;


            booking.status =
                "cancelled";


            localStorage.setItem(
                "ownerBookings",
                JSON.stringify(bookings)
            );


            displayBookings();


            alert(
                "Booking cancelled."
            );

        };

});
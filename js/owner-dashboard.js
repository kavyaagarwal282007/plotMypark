document.addEventListener("DOMContentLoaded", function () {

    const savedSpace =
        localStorage.getItem("ownerSpace");


    const spaceContainer =
        document.getElementById("spaceContainer");


    const welcomeName =
        document.getElementById("welcomeName");


    const spaceCount =
        document.getElementById("spaceCount");


    const availableSpots =
        document.getElementById("availableSpots");


    /*
       DEMO OWNER
    */

    const ownerName =
        localStorage.getItem("ownerName") ||
        "Parking Owner";


    welcomeName.textContent =
        "Welcome, " + ownerName;


    /*
       NO SPACE REGISTERED
    */

    if (!savedSpace) {

        spaceCount.textContent = "0";

        availableSpots.textContent = "0";


        spaceContainer.innerHTML = `

            <div class="no-space-card">

                <div class="no-space-icon">
                    🅿️
                </div>

                <h3>
                    No parking space listed
                </h3>

                <p>
                    Add your parking space or vacant land
                    to start receiving bookings.
                </p>

                <button
                    onclick="window.location.href='owner-register.html'"
                    class="add-space-btn"
                >
                    + List Your Space
                </button>

            </div>

        `;

        return;
    }


    /*
       READ SAVED SPACE
    */

    const space =
        JSON.parse(savedSpace);


    spaceCount.textContent = "1";


    /*
       DEMO AVAILABILITY
    */

    const capacity =
        Number(space.capacity) || 0;


    const occupied =
        Number(
            localStorage.getItem("occupiedSpots")
        ) || 0;


    const available =
        Math.max(
            capacity - occupied,
            0
        );


    availableSpots.textContent =
        available;


    /*
       DISPLAY SPACE
    */

    const status =
        space.status || "PENDING";


    let statusClass =
        "status-pending";


    if (status === "ACTIVE") {
        statusClass = "status-active";
    }

    if (status === "CLOSED") {
        statusClass = "status-closed";
    }


    spaceContainer.innerHTML = `

        <div class="owner-space-card">

            <div class="space-card-top">

                <div>

                    <span class="space-type-label">

                        ${
                            space.spaceType === "vacant"
                            ? "🏗️ VACANT LAND"
                            : "🅿️ EXISTING PARKING"

                        }

                    </span>

                    <h3>
                        ${space.spaceName}
                    </h3>

                    <p>
                        📍 ${space.city}
                    </p>

                </div>


                <span class="space-status ${statusClass}">
                    ${status}
                </span>

            </div>


            <div class="space-info-grid">

                <div>

                    <small>
                        Capacity
                    </small>

                    <strong>
                        ${capacity} vehicles
                    </strong>

                </div>


                <div>

                    <small>
                        Available
                    </small>

                    <strong>
                        ${available} spots
                    </strong>

                </div>


                <div>

                    <small>
                        Price
                    </small>

                    <strong>
                        ₹${space.price}/hour
                    </strong>

                </div>


                <div>

                    <small>
                        Hours
                    </small>

                    <strong>
                        ${space.openingTime} -
                        ${space.closingTime}
                    </strong>

                </div>

            </div>


            <div class="space-card-actions">

                <button
                    class="manage-btn"
                    onclick="window.location.href='manage-parking.html'"
                >
                    Manage Parking
                </button>


                <button
                    class="secondary-space-btn"
                    onclick="window.location.href='owner-bookings.html'"
                >
                    View Bookings
                </button>

            </div>

        </div>

    `;

});
document.addEventListener("DOMContentLoaded", function () {

    const savedSpace =
        localStorage.getItem("ownerSpace");

    if (!savedSpace) {

        alert("No parking space found.");

        window.location.href =
            "owner-register.html";

        return;
    }


    const space =
        JSON.parse(savedSpace);


    /* ELEMENTS */

    const parkingName =
        document.getElementById("parkingName");

    const parkingLocation =
        document.getElementById("parkingLocation");

    const currentStatus =
        document.getElementById("currentStatus");

    const statusDot =
        document.getElementById("statusDot");

    const statusDescription =
        document.getElementById("statusDescription");

    const toggleStatus =
        document.getElementById("toggleStatus");

    const totalCapacity =
        document.getElementById("totalCapacity");

    const occupiedCount =
        document.getElementById("occupiedCount");

    const availableCount =
        document.getElementById("availableCount");

    const capacityFill =
        document.getElementById("capacityFill");

    const capacityPercentage =
        document.getElementById("capacityPercentage");

    const priceInput =
        document.getElementById("priceInput");

    const openingInput =
        document.getElementById("openingInput");

    const closingInput =
        document.getElementById("closingInput");


    /* LOAD DATA */

    parkingName.textContent =
        space.spaceName || "Parking Space";

    parkingLocation.textContent =
        "📍 " + (space.city || "Location");


    totalCapacity.textContent =
        space.capacity || 0;

    priceInput.value =
        space.price || 0;

    openingInput.value =
        space.openingTime || "08:00";

    closingInput.value =
        space.closingTime || "22:00";


    let capacity =
        Number(space.capacity) || 0;


    let occupied =
        Number(
            localStorage.getItem("occupiedSpots")
        ) || 0;


    let status =
        localStorage.getItem("parkingStatus") ||
        "ACTIVE";


    function updateDisplay() {

        occupied =
            Math.max(
                0,
                Math.min(
                    occupied,
                    capacity
                )
            );


        const available =
            capacity - occupied;


        const occupiedPercentage =
            capacity > 0
            ? Math.round(
                (occupied / capacity) * 100
            )
            : 0;


        availableCount.textContent =
            available;


        occupiedCount.textContent =
            occupied;


        totalCapacity.textContent =
            capacity;


        capacityPercentage.textContent =
            occupiedPercentage + "%";


        capacityFill.style.width =
            occupiedPercentage + "%";


        currentStatus.textContent =
            status;


        if (status === "ACTIVE") {

            statusDot.className =
                "status-dot active-dot";

            statusDescription.textContent =
                "Drivers can currently see and reserve this parking space.";

            toggleStatus.textContent =
                "Close Parking";

        } else {

            statusDot.className =
                "status-dot closed-dot";

            statusDescription.textContent =
                "Drivers cannot reserve this parking space right now.";

            toggleStatus.textContent =
                "Open Parking";
        }


        document.getElementById(
            "previewName"
        ).textContent =
            space.spaceName || "Parking Space";


        document.getElementById(
            "previewLocation"
        ).textContent =
            "📍 " + (space.city || "Location");


        document.getElementById(
            "previewAvailable"
        ).textContent =
            available;


        document.getElementById(
            "previewPrice"
        ).textContent =
            priceInput.value || 0;


        const previewStatus =
            document.getElementById(
                "previewStatus"
            );


        if (status === "ACTIVE") {

            previewStatus.textContent =
                "AVAILABLE";

            previewStatus.className =
                "preview-available";

        } else {

            previewStatus.textContent =
                "CLOSED";

            previewStatus.className =
                "preview-closed";
        }


        localStorage.setItem(
            "occupiedSpots",
            occupied
        );

        localStorage.setItem(
            "parkingStatus",
            status
        );

    }


    /* STATUS TOGGLE */

    toggleStatus.addEventListener(
        "click",
        function () {

            if (status === "ACTIVE") {

                status = "CLOSED";

            } else {

                status = "ACTIVE";

            }

            updateDisplay();

            showMessage(
                status === "ACTIVE"
                    ? "Parking is now open."
                    : "Parking has been temporarily closed."
            );

        }
    );


    /* VEHICLE ENTERED */

    document.getElementById(
        "addVehicle"
    ).addEventListener(
        "click",
        function () {

            if (occupied < capacity) {

                occupied++;

                updateDisplay();

            } else {

                showMessage(
                    "Parking is already full."
                );

            }

        }
    );


    /* VEHICLE LEFT */

    document.getElementById(
        "removeVehicle"
    ).addEventListener(
        "click",
        function () {

            if (occupied > 0) {

                occupied--;

                updateDisplay();

            } else {

                showMessage(
                    "No occupied spots to remove."
                );

            }

        }
    );


    /* SAVE PRICE */

    document.getElementById(
        "savePrice"
    ).addEventListener(
        "click",
        function () {

            space.price =
                priceInput.value;

            localStorage.setItem(
                "ownerSpace",
                JSON.stringify(space)
            );

            updateDisplay();

            showMessage(
                "Parking price updated successfully."
            );

        }
    );


    /* SAVE HOURS */

    document.getElementById(
        "saveHours"
    ).addEventListener(
        "click",
        function () {

            space.openingTime =
                openingInput.value;

            space.closingTime =
                closingInput.value;


            localStorage.setItem(
                "ownerSpace",
                JSON.stringify(space)
            );


            showMessage(
                "Operating hours updated successfully."
            );

        }
    );


    /* MESSAGE */

    function showMessage(message) {

        const messageBox =
            document.getElementById(
                "saveMessage"
            );


        messageBox.textContent =
            "✓ " + message;


        setTimeout(
            function () {

                messageBox.textContent =
                    "";

            },
            2500
        );

    }


    updateDisplay();

});
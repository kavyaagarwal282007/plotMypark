const spaceForm =
    document.getElementById("spaceForm");

const locationButton =
    document.getElementById("locationButton");

const locationStatus =
    document.getElementById("locationStatus");


/* CURRENT LOCATION */

locationButton.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            locationStatus.textContent =
                "Location is not supported by this browser.";

            return;
        }


        locationStatus.textContent =
            "Getting your location...";


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                localStorage.setItem(
                    "ownerLatitude",
                    latitude
                );

                localStorage.setItem(
                    "ownerLongitude",
                    longitude
                );


                locationStatus.textContent =
                    `Location captured ✓ (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

            },

            function () {

                locationStatus.textContent =
                    "Unable to get location. Please enter the address manually.";

            }

        );

    }
);



/* FORM SUBMISSION */

spaceForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const selectedType =
            document.querySelector(
                'input[name="spaceType"]:checked'
            ).value;


        const spaceData = {

            spaceType: selectedType,

            spaceName:
                document.getElementById("spaceName").value,

            capacity:
                document.getElementById("capacity").value,

            price:
                document.getElementById("price").value,

            address:
                document.getElementById("address").value,

            city:
                document.getElementById("city").value,

            pincode:
                document.getElementById("pincode").value,

            availableFrom:
                document.getElementById("availableFrom").value,

            availableUntil:
                document.getElementById("availableUntil").value,

            openingTime:
                document.getElementById("openingTime").value,

            closingTime:
                document.getElementById("closingTime").value,

            description:
                document.getElementById("description").value,

            ownerName:
                document.getElementById("ownerName").value,

            ownerEmail:
                document.getElementById("ownerEmail").value,

            ownerPhone:
                document.getElementById("ownerPhone").value,

            latitude:
                localStorage.getItem("ownerLatitude"),

            longitude:
                localStorage.getItem("ownerLongitude"),

            status: "PENDING"

        };


        /* DEMO STORAGE */

        localStorage.setItem(
           
             "ownerSpace",
    JSON.stringify(spaceData)
);

localStorage.setItem(
    "ownerName",
    spaceData.ownerName
        );


        alert(
            "Your parking space has been submitted successfully!"
        );


        window.location.href =
            "owner-dashboard.html";

    }
);
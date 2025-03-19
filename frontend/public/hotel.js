document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("hotelModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalLocation = document.getElementById("modalLocation");
    const modalPrice = document.getElementById("modalPrice");
    const modalDescription = document.getElementById("modalDescription");

    const closeModal = document.querySelector(".close-btn");
    const bookNow = document.getElementById("bookNow");
    const totalPriceElement = document.getElementById("totalPrice");

    // Ensure modal is hidden on page load
    modal.style.display = "none";

    // Attach event listener to the container for dynamically loaded hotel cards
    document.querySelector(".container").addEventListener("click", function (event) {
        if (event.target.classList.contains("view-details")) {
            const hotelCard = event.target.closest(".hotel-card");

            modalTitle.textContent = hotelCard.dataset.name;
            modalLocation.textContent = "Location: " + hotelCard.dataset.location;
            modalPrice.textContent = "Price per night per person: " + hotelCard.dataset.price;
            modalDescription.textContent = "Details: " + hotelCard.dataset.details;
        

            // Show the modal only when the user clicks "View Details"
            modal.style.display = "flex";
        }
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Update total price dynamically based on guests and nights
    function updateTotalPrice() {
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;
        const guests = document.getElementById("guests").value;
        const pricePerNight = parseFloat(modalPrice.textContent.replace(/[^0-9.]/g, ''));

        if (checkin && checkout && guests) {
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            const nights = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);

            if (nights > 0) {
                const totalPrice = nights * pricePerNight * guests;
                totalPriceElement.textContent = `Total Price: ₹${totalPrice.toFixed(2)}`;
            } else {
                totalPriceElement.textContent = "";
            }
        } else {
            totalPriceElement.textContent = "";
        }
    }

    document.getElementById("checkin").addEventListener("change", updateTotalPrice);
    document.getElementById("checkout").addEventListener("change", updateTotalPrice);
    document.getElementById("guests").addEventListener("input", updateTotalPrice);

    bookNow.addEventListener("click", function () {
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;
        const guests = document.getElementById("guests").value;

        if (!checkin || !checkout || !guests) {
            alert("Please fill all booking details");
            return;
        }

        alert("Hotel booked successfully!\nCheck-in: " + checkin + "\nCheck-out: " + checkout + "\nGuests: " + guests);
        modal.style.display = "none";
    });
});

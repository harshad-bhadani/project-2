document.addEventListener("DOMContentLoaded", () => {
    const bookNowButtons = document.querySelectorAll(".book-now-btn");

    bookNowButtons.forEach(button => {
        button.addEventListener("click", async (event) => {
            const packageCard = event.target.closest(".card");
            const packageId = packageCard.dataset.packageId;
            const userEmail = localStorage.getItem("userEmail");
            const bookingDate = new Date().toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:MM:SS

            console.log("🔹 Booking button clicked.", { packageId, userEmail, bookingDate });

            if (!userEmail) {
                alert(" Please log in to book a package!");
                return;
            }

            try {
                console.log(`🔹 Fetching user ID for email: ${userEmail}`);

                // Fetch user ID
                const userResponse = await fetch(`/get-user?email=${userEmail}`);
                const userData = await userResponse.json();
                console.log("🔹 User Data Fetched:", userData);

                if (!userResponse.ok || !userData.id) {
                    console.error(" User fetch failed:", userData.message || "User not found");
                    alert(` ${userData.message || "User not found"}`);
                    return;
                }

                const userId = userData.id;
                console.log(` User ID fetched: ${userId}`);

                console.log(`🔹 Fetching package price for Package ID: ${packageId}`);

                // Fetch package price from the backend
                const packageResponse = await fetch(`/get-package-price?package_id=${packageId}`);
                const packageData = await packageResponse.json();
                console.log("🔹 Package Price Response:", packageData);

                if (!packageResponse.ok || !packageData.success) {
                    console.error(" Price fetch failed:", packageData.message);
                    alert(` ${packageData.message}`);
                    return;
                }

                const totalPrice = packageData.price;
                console.log(` Package Price Received: $${totalPrice}`);

                console.log(`🔹 Sending booking request with data:`, { userId, packageId, totalPrice, bookingDate });

                const bookingResponse = await fetch("/book-package", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        package_id: packageId,
                        total_price: totalPrice, // Now sending correct price
                        booking_date: bookingDate
                    })
                });

                const bookingData = await bookingResponse.json();
                console.log("🔹 Booking Response:", bookingData);

                if (bookingResponse.ok && bookingData.success) {
                    console.log(` Package booked! Total Price: ₹${bookingData.total_price}`);
                    alert(` Package booked successfully! Total Price: ₹${bookingData.total_price}`);
                } else {
                    console.error(" Booking Failed:", bookingData.message);
                    alert(` ${bookingData.message}`);
                }
            } catch (error) {
                console.error(" Booking Error:", error);
                alert(" Server error. Please try again.");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", loadPackages);

function loadPackages() {
  fetch("http://localhost:8000/package")
    .then(res => res.json())
    .then(packages => {
      const container = document.getElementById("packages-container");
      container.innerHTML = ""; // Clear previous cards

      packages.forEach(pkg => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("data-package-id", pkg.id);

        card.innerHTML = `
          <img src="${pkg.image_url}" alt="${pkg.name}">
          <div class="card-content">
            <h3>${pkg.name}</h3>
            <p>${pkg.duration} days in ${pkg.destination}: ${pkg.description}</p>
            <span class="price">₹${pkg.price}/-</span>
            <a href="#book" class="book-now-btn">Book Now</a>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => console.error(" Error loading packages:", err));
}

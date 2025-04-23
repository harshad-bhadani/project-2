document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("hotelModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalLocation = document.getElementById("modalLocation");
    const modalPrice = document.getElementById("modalPrice");
    const modalDescription = document.getElementById("modalDescription");
    const closeModal = document.querySelector(".close-btn");
    const bookNow = document.getElementById("bookNow");
    const totalPriceElement = document.getElementById("totalPrice");
  
    modal.style.display = "none";
  
    // Hotel card click for modal
    document.querySelector(".container").addEventListener("click", (event) => {
      if (event.target.classList.contains("view-details")) {
        const hotelCard = event.target.closest(".hotel-card");
  
        modalTitle.textContent = hotelCard.dataset.name;
        modalLocation.textContent = "Location: " + hotelCard.dataset.location;
        modalPrice.textContent = "Price per night per person: " + hotelCard.dataset.price;
        modalDescription.textContent = "Details: " + hotelCard.dataset.details;
        modalTitle.dataset.hotelId = hotelCard.dataset.id;
  
        modal.style.display = "flex";
      }
    });
  
    // Modal close
    closeModal.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  
    // Total price calculation
    function updateTotalPrice() {
      const checkin = document.getElementById("checkin").value;
      const checkout = document.getElementById("checkout").value;
      const guests = document.getElementById("guests").value;
      const pricePerNight = parseFloat(modalPrice.textContent.replace(/[^0-9.]/g, '')) || 0;
  
      if (checkin && checkout && guests) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        const nights = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
  
        if (nights > 0) {
          const totalPrice = nights * pricePerNight * guests;
          totalPriceElement.textContent = `Total Price: ₹${totalPrice.toFixed(2)}`;
          totalPriceElement.dataset.value = totalPrice.toFixed(2);
        } else {
          totalPriceElement.textContent = "";
          totalPriceElement.dataset.value = "";
        }
      } else {
        totalPriceElement.textContent = "";
        totalPriceElement.dataset.value = "";
      }
    }
  
    document.getElementById("checkin").addEventListener("change", updateTotalPrice);
    document.getElementById("checkout").addEventListener("change", updateTotalPrice);
    document.getElementById("guests").addEventListener("input", updateTotalPrice);
  
    // Booking handler
    bookNow.addEventListener("click", async () => {
      const checkinElement = document.getElementById("checkin");
      const checkoutElement = document.getElementById("checkout");
      const guestsElement = document.getElementById("guests");
      const hotelId = modalTitle.dataset.hotelId;
  
      if (!checkinElement || !checkoutElement || !guestsElement || !hotelId) {
        alert(" Error: Missing required input fields. Please refresh the page and try again.");
        return;
      }
  
      const checkin = checkinElement.value;
      const checkout = checkoutElement.value;
      const guests = guestsElement.value;
      const totalPrice = parseFloat(totalPriceElement.dataset.value) || 0;
  
      if (!checkin || !checkout || !guests || isNaN(totalPrice) || totalPrice <= 0 || !hotelId) {
        alert(" Missing required fields. Please check all inputs.");
        return;
      }
  
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          alert(" No user email found. Please log in again.");
          return;
        }
  
        const userRes = await fetch(`/get-user?email=${userEmail}`);
        const userData = await userRes.json();
  
        const bookingData = {
          user_id: userData.id,
          hotel_id: parseInt(hotelId),
          check_in: checkin,
          check_out: checkout,
          guests: guests,
          total_price: totalPrice,
        };
  
        const response = await fetch("/book-hotel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        });
  
        const result = await response.json();
        if (response.ok) {
          alert(" Booking Successful!");
          modal.style.display = "none";
        } else {
          alert(result.message || " Booking failed");
        }
      } catch (error) {
        console.error("Booking Error:", error);
        alert(" Server error. Try again later.");
      }
    });
  
    // Fetch and render hotels
    fetch("http://localhost:8000/api/hotels")
      .then(res => res.json())
      .then(hotels => {
        const container = document.getElementById("hotel-container");
        container.innerHTML = "";
  
        hotels.forEach(hotel => {
          const hotelCard = document.createElement("div");
          hotelCard.className = "hotel-card";
          hotelCard.setAttribute("data-id", hotel.id);
          hotelCard.setAttribute("data-name", hotel.name);
          hotelCard.setAttribute("data-location", hotel.location);
          hotelCard.setAttribute("data-price", `₹${hotel.price_per_night}`);
          hotelCard.setAttribute("data-details", hotel.amenities);
  
          const imageUrl = hotel.image_url.startsWith("http") || hotel.image_url.startsWith("/")
            ? hotel.image_url
            : `../styles/${hotel.image_url}`;
  
            hotelCard.innerHTML = `
            <div class="hotel-image">
              <img src="/styles/${hotel.image_url}" alt="${hotel.name}" onerror="this.src='../styles/f13.png'">
            </div>
            <div class="hotel-details">
              <h2 class="hotel-name">${hotel.name}</h2>
              <p class="location">${hotel.location}</p>
              <a href="${hotel.view_360_link || '#'}" class="viewIn360">View in 360</a>
              <p>${hotel.amenities}</p>
              <div class="hotel-features">
                ${hotel.amenities.includes('WiFi') ? '<img src="https://img.icons8.com/ios-filled/50/000000/wifi.png" alt="Wi-Fi">' : ''}
                ${hotel.amenities.includes('Spa') ? '<img src="https://img.icons8.com/ios-filled/50/000000/spa.png" alt="Spa">' : ''}
                 ${hotel.amenities.includes('Pool') ? '<img src="https://img.icons8.com/ios-filled/50/000000/swimming.png" alt="Swimming Pool">' : ''}
                 ${hotel.amenities.includes('parking') ? '  <img src="https://img.icons8.com/ios-filled/50/000000/parking.png" alt="Parking">' : ''}
                 ${hotel.amenities.includes('Swimming') ? '<img src="https://img.icons8.com/ios-filled/50/000000/swimming.png" alt="Swimming Pool">' : ''}
                 ${hotel.amenities.includes('Swimming') ? '<img src="https://img.icons8.com/ios-filled/50/000000/swimming.png" alt="Swimming Pool">' : ''}
                
              </div>
              <div class="price">₹${hotel.price_per_night} 
                <span class="original-price">₹${hotel.original_price || (parseFloat(hotel.price_per_night) + 2000)}</span>

              </div>
              <a href="#" class="view-details">View Details</a>
            </div>
          `;
          
  
          container.appendChild(hotelCard);
        });
      })
      .catch(err => {
        console.error("Failed to fetch hotels:", err);
      });
  });
  
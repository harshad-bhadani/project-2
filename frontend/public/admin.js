document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin Dashboard Loaded");

  loadUsers();
  loadBookings();
  loadPackages();
  loadHotels(); // ✅ Add this line to load hotel data
  loadAllPackages(); // Load packages into admin package table


  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    alert(" Logged out successfully!");
    window.location.href = "/main.html";
  });
});

// 🔹 Load all users
function loadUsers() {
  axios.get("http://localhost:8000/users")
    .then(res => {
      const users = res.data;
      document.getElementById("user-count").innerText = users.length;

      const tbody = document.getElementById("user-table-body");
      tbody.innerHTML = "";

      users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.userType}</td>
          <td><button onclick="deleteUser('${user.id}')">❌ Delete</button></td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error(" Error loading users:", err);
    });
}

// 🔹 Load hotel bookings
function loadBookings() {
  axios.get("http://localhost:8000/hotel-bookings")
    .then(res => {
      const bookings = res.data;
      document.getElementById("booking-count").innerText = bookings.length;

      const tbody = document.getElementById("hotel-bookings-table-body");
      tbody.innerHTML = "";

      bookings.forEach((booking, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${booking.user_name}</td>
          <td>${booking.user_email}</td>
          <td>${booking.hotel_name}</td>
          <td>${booking.check_in}</td>
          <td>${booking.check_out}</td>
          <td>${booking.guests}</td>
          <td>₹${booking.total_price}</td>
          <td>${booking.status}</td>
          <td><button onclick="deleteBooking('${booking.id}')">🗑</button></td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error(" Error loading bookings:", err);
    });
}

// 🔹 Load packages
function loadPackages() {
  axios.get("http://localhost:8000/packages")
    .then(res => {
      const packages = res.data;
      const tbody = document.getElementById("package-table-body1");
      tbody.innerHTML = "";

      packages.forEach((pkg, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${pkg.user_id}</td>
          <td>${pkg.package_id}</td>
          <td>₹${pkg.total_price}</td>
          <td>${pkg.status}</td>
          <td><button onclick="deletePackage('${pkg.id}')">🗑</button></td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error(" Error loading packages:", err);
    });
}

// 🔹 Load hotels (✅ Make sure this runs)
function loadHotels() {
  fetch("http://localhost:8000/hotels")
    .then(res => res.json())
    .then(hotels => {
      const hotelBody = document.getElementById("hotel-table-body");
      hotelBody.innerHTML = '';
      hotels.forEach(hotel => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${hotel.id}</td>
          <td>${hotel.name}</td>
          <td>${hotel.location}</td>
          <td>₹${hotel.price_per_night}</td>
          <td>${hotel.amenities}</td>
          <td><button onclick="deleteHotel(${hotel.id})">Delete</button></td>
        `;
        hotelBody.appendChild(row);
      });
    })
    .catch(err => console.error("❌ Error loading hotels:", err));
}

// 🔹 Delete user
function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    axios.delete(`http://localhost:8000/users/${userId}`)
      .then(() => {
        alert(" User deleted!");
        loadUsers();
      })
      .catch(err => {
        console.error("❌ Error deleting user:", err);
        alert("❌ Could not delete user.");
      });
  }
}

// 🔹 Delete booking
function deleteBooking(bookingId) {
  if (confirm("Are you sure you want to delete this booking?")) {
    axios.delete(`http://localhost:8000/delete-booking/${bookingId}`)
      .then(() => {
        alert(" Booking deleted!");
        loadBookings();
      })
      .catch(err => {
        console.error(" Error deleting booking:", err);
        alert(" Could not delete booking.");
      });
  }
}

// 🔹 Delete package
function deletePackage(packageId) {
  if (confirm("Are you sure you want to delete this package?")) {
    axios.delete(`http://localhost:8000/packages/${packageId}`)
      .then(() => {
        alert(" Package deleted!");
        loadPackages();
      })
      .catch(err => {
        console.error(" Error deleting package:", err);
        alert(" Could not delete package.");
      });
  }
}

// 🔹 Delete hotel
function deleteHotel(hotelId) {
  if (confirm("Are you sure you want to delete this hotel?")) {
    fetch(`http://localhost:8000/hotels/${hotelId}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadHotels();
      })
      .catch(err => {
        console.error(" Failed to delete hotel:", err);
        alert(" Failed to delete hotel.");
      });
  }
}

// 🔹 Add Hotel
document.getElementById("submit-hotel").addEventListener("click", () => {
  const name = document.getElementById("hotel-name").value.trim();
  const location = document.getElementById("hotel-location").value.trim();
  const image_url = document.getElementById("hotel-image").value.trim();
  const price_per_night = document.getElementById("hotel-price").value.trim();
  const amenities = document.getElementById("hotel-amenities").value.trim();

  if (!name || !location || !image_url || !price_per_night || !amenities) {
    alert(" Please fill in all hotel fields!");
    return;
  }

  fetch("http://localhost:8000/add-hotel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, location, image_url, price_per_night, amenities }),
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadHotels(); // Refresh hotel list after adding
    })
    .catch(err => console.error(" Error adding hotel:", err));
});

// 🔹 Add Package
document.getElementById("submit-package").addEventListener("click", () => {
  const name = document.getElementById("package-name").value.trim();
  const destination = document.getElementById("package-destination").value.trim();
  const duration = document.getElementById("package-duration").value.trim();
  const description = document.getElementById("package-description").value.trim();
  const image_url = document.getElementById("package-image").value.trim();
  const price = document.getElementById("package-price").value.trim();

  if (!name || !destination || !duration || !description || !image_url || !price) {
    alert(" Please fill in all package fields!");
    return;
  }

  fetch("http://localhost:8000/add-package", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, destination, duration, description, image_url, price }),
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || " Package added successfully!");
      document.getElementById("package-modal").style.display = "none";
      loadPackages(); // Refresh list if implemented
    })
    .catch(err => console.error(" Error adding package:", err));
});


// packages all
// 🔹 Fetch and display packages
function loadAllPackages() {
  fetch('/package')
    .then(res => res.json())
    .then(packages => {
      const packageBody = document.getElementById('package-table-body');
      packageBody.innerHTML = ''; // Clear previous rows

      packages.forEach(pkg => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${pkg.id}</td>
          <td>${pkg.name}</td>
          <td>${pkg.description}</td>
          <td><img src="${pkg.image_url}" alt="${pkg.title}" style="width: 80px; height: 50px; object-fit: cover;" /></td>
          <td>₹${pkg.price}</td>
          <td>
            <button class="delete-btn" onclick="deleteAdminPackage(${pkg.id})">Delete</button>
          </td>
        `;
        packageBody.appendChild(row);
      });
    })
    .catch(err => console.error("Error loading packages:", err));
}

// 🔹 Delete package from admin panel
function deleteAdminPackage(packageId) {
  if (confirm("Are you sure you want to delete this package?")) {
    fetch(`/package/${packageId}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadAllPackages();
      })
      .catch(err => {
        console.error("Failed to delete package:", err);
        alert("Failed to delete package.");
      });
  }
}


// 🔹 Modal handling
document.addEventListener("DOMContentLoaded", () => {
  const addHotelBtn = document.getElementById("show-add-hotel-form");
  const addPackageBtn = document.getElementById("show-add-package-form");
  const hotelModal = document.getElementById("hotel-modal");
  const packageModal = document.getElementById("package-modal");

  if (addHotelBtn && hotelModal) {
    addHotelBtn.addEventListener("click", () => {
      hotelModal.style.display = "block";
    });
  }

  if (addPackageBtn && packageModal) {
    addPackageBtn.addEventListener("click", () => {
      packageModal.style.display = "block";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === hotelModal) hotelModal.style.display = "none";
    if (event.target === packageModal) packageModal.style.display = "none";
  });
});

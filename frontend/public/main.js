document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const profileDropdown = document.getElementById("profile-dropdown");
    const profileIcon = document.getElementById("profile-icon");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const usernameDisplay = document.getElementById("username-display");
    const currentUsername = document.getElementById("current-username");

    // Modals
    const usernameModal = document.getElementById("username-modal");
    const passwordModal = document.getElementById("password-modal");
    const closeUsernameModal = document.getElementById("close-username-modal");
    const closePasswordModal = document.getElementById("close-password-modal");

    // Inputs
    const newUsernameInput = document.getElementById("new-username");
    const newPasswordInput = document.getElementById("new-password");

    // Buttons
    const saveUsernameBtn = document.getElementById("save-username");
    const savePasswordBtn = document.getElementById("save-password");
    const editUsernameBtn = document.getElementById("edit-username");
    const changePasswordBtn = document.getElementById("change-password");

    // Retrieve login state
    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) { 
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        profileDropdown.style.display = "flex";

        // Fetch username from the API
        fetch(`http://localhost:8000/get-user?email=${userEmail}`)
            .then(response => response.json())
            .then(data => {
                if (data.username) {
                    usernameDisplay.textContent = data.username;
                    currentUsername.textContent = `Username: ${data.username}`;
                }
            })
            .catch(error => console.error("Error fetching username:", error));
    } else {
        profileDropdown.style.display = "none";
        loginBtn.style.display = "block";
        signupBtn.style.display = "block";
    }

    // Toggle dropdown menu
    profileIcon.addEventListener("click", () => {
        dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!profileDropdown.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });

    // Open username modal
    editUsernameBtn.addEventListener("click", () => {
        usernameModal.style.display = "flex";
    });

    // Open password modal
    changePasswordBtn.addEventListener("click", () => {
        passwordModal.style.display = "flex";
    });

    // Close modals using close buttons
    closeUsernameModal.addEventListener("click", () => {
        usernameModal.style.display = "none";
    });

    closePasswordModal.addEventListener("click", () => {
        passwordModal.style.display = "none";
    });

    // Close modals when clicking outside modal
    window.addEventListener("click", (event) => {
        if (event.target === usernameModal) usernameModal.style.display = "none";
        if (event.target === passwordModal) passwordModal.style.display = "none";
    });

    // Save new username
    saveUsernameBtn.addEventListener("click", () => {
        const newUsername = newUsernameInput.value.trim();
        if (!newUsername) {
            alert(" Please enter a new username!");
            return;
        }

        fetch("http://localhost:8000/update-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, newUsername }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message.includes("✅")) {
                usernameDisplay.textContent = newUsername;
                currentUsername.textContent = `Username: ${newUsername}`;
                usernameModal.style.display = "none";
            }
        })
        .catch(error => console.error("Error updating username:", error));
    });

    // Save new password
    savePasswordBtn.addEventListener("click", () => {
        const newPassword = newPasswordInput.value.trim();
        if (!newPassword) {
            alert(" Please enter a new password!");
            return;
        }

        fetch("http://localhost:8000/update-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, newPassword }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message.includes("✅")) {
                passwordModal.style.display = "none";
            }
        })
        .catch(error => console.error("Error updating password:", error));
    });

    // Logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("userEmail");

        fetch("http://localhost:8000/logout", { method: "POST" })
            .then(() => {
                alert(" Logged out successfully!");
                window.location.href = "main.html";
            })
            .catch(error => console.error("Error:", error));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const showBookingsBtn = document.getElementById('showBookingsBtn');
    const bookingsContainer = document.getElementById('profileBookings');
  
    showBookingsBtn.addEventListener('click', async () => {
      // Toggle visibility
      bookingsContainer.style.display = bookingsContainer.style.display === 'none' ? 'block' : 'none';
  
      const email = localStorage.getItem('userEmail');
      if (!email) {
        console.error('User email not found in localStorage');
        return;
      }
  
      try {
        // Get user ID
        const userRes = await fetch(`/get-user?email=${email}`);
        const userData = await userRes.json();
        const userId = userData.id;
  
        if (!userId) {
          console.error('User ID not found from response');
          return;
        }
  
        // Clear previous content
        document.getElementById('hotel-bookings').innerHTML = '';
        document.getElementById('package-bookings').innerHTML = '';
  
        // Fetch hotel bookings
        const hotelRes = await fetch(`/get-hotel-bookings/${userId}`);
        const hotelBookings = await hotelRes.json();
        console.log('Hotel Bookings:', hotelBookings);
        renderBookings('hotel-bookings', hotelBookings, 'hotel');
  
        // Fetch package bookings
        const packageRes = await fetch(`/get-package-bookings/${userId}`);
        const packageBookings = await packageRes.json();
        console.log('Package Bookings:', packageBookings);
        renderBookings('package-bookings', packageBookings, 'package');
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    });
  
    function renderBookings(containerId, bookings, type) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
  
      if (!Array.isArray(bookings) || bookings.length === 0) {
        container.innerHTML = '<p>No bookings found.</p>';
        return;
      }
  
      bookings.forEach(booking => {
        const div = document.createElement('div');
        div.className = 'booking-item';
        div.innerHTML = `
          <span><strong>${booking.name}</strong> | Status: ${booking.status}</span>
          <button onclick="cancelBooking(${booking.id}, '${type}')">Cancel</button>
        `;
        container.appendChild(div);
      });
    }
  });
  
  
  // Global cancel function
  function cancelBooking(id, type) {
    const endpoint = type === 'hotel' ? '/cancel-hotel-booking' : '/cancel-package-booking';
    
    fetch(`${endpoint}/${id}`, { method: 'PUT' })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Booking canceled.');
        document.getElementById('showBookingsBtn').click(); // Refresh list
      })
      .catch(err => console.error('Cancel failed:', err));
  }
  


  // search functionality

  document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-button");
    const placesContainer = document.getElementById("places-container");

    // Function to fetch and display popular places
    function fetchPlaces(query = "") {
        // Clear the container before adding new data
        placesContainer.innerHTML = "";

        // Use the search query if available, otherwise fetch all places
        const apiUrl = query ? `http://localhost:8000/get-popular-places?search=${query}` : "http://localhost:8000/get-popular-places";

        fetch(apiUrl)
            .then(response => response.json())
            .then(placesData => {
                if (placesData.length > 0) {
                    displayPlaces(placesData);
                } else {
                    placesContainer.innerHTML = "<p>No places found matching your search.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching popular places:", error);
                placesContainer.innerHTML = "<p>Error fetching data. Please try again later.</p>";
            });
    }

    // Function to display places in the container
    function displayPlaces(places) {
        places.forEach(function (place) {
            const placeElement = document.createElement("div");
            placeElement.classList.add("page-card");

            placeElement.innerHTML = `
                <img src="${place.image_url}" alt="${place.name}">
                <h2>${place.name}</h2>
                <p>${place.description}</p>
                <a href="${place.read_more}">Read More</a>
            `;

            placesContainer.appendChild(placeElement);
        });
    }

    // Trigger search when the user types in the input field (real-time search)
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (query) {
            fetchPlaces(query);  // Fetch filtered places based on the query
        } else {
            placesContainer.innerHTML = "";  // Clear the container when search is empty
        }
    });

    // Trigger search when the user clicks the search button
    searchBtn.addEventListener("click", function () {
        const query = searchInput.value.trim();
        if (query) {
            fetchPlaces(query);  // Fetch filtered places based on the query
        } else {
            placesContainer.innerHTML = "";  // Clear the container when search is empty
        }
    });

    // Fetch and display all places initially (empty container, no data)
    placesContainer.innerHTML = "";
});


document.addEventListener("DOMContentLoaded", () => {
    const usernameElement = document.getElementById("username");
    const emailElement = document.getElementById("email");
    const profileImgElement = document.getElementById("profile-img");
    const editUsernameBtn = document.getElementById("edit-username");
    const changePasswordBtn = document.getElementById("change-password");
    const logoutBtn = document.getElementById("logout-btn");

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    // Fetch user data including profile image
    fetch("http://localhost:8000/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            usernameElement.textContent = data.username;
            emailElement.textContent = data.email;
            profileImgElement.src = data.profileImage || "https://via.placeholder.com/100";
        } else {
            alert("Error fetching user data");
        }
    })
    .catch(error => console.error("Error:", error));

    // Edit Username
    editUsernameBtn.addEventListener("click", () => {
        const newUsername = prompt("Enter new username:");
        if (newUsername) {
            fetch("http://localhost:8000/update-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, newUsername }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) usernameElement.textContent = newUsername;
            })
            .catch(error => console.error("Error:", error));
        }
    });

    // Change Password
    changePasswordBtn.addEventListener("click", () => {
        const newPassword = prompt("Enter new password:");
        if (newPassword) {
            fetch("http://localhost:8000/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, newPassword }),
            })
            .then(response => response.json())
            .then(data => alert(data.message))
            .catch(error => console.error("Error:", error));
        }
    });

    // Logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("userEmail");

        fetch("http://localhost:8000/logout", { method: "POST" })
            .then(() => {
                alert(" Logged out successfully!");
                window.location.href = "login.html";
            })
            .catch(error => console.error("Error:", error));
    });
});

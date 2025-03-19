document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ Admin Dashboard Loaded");

    // Fetch user data from backend
    try {
        const response = await axios.get("http://localhost:8000/users");
        const users = response.data;

        document.getElementById("user-count").innerText = users.length;
        
        const userTableBody = document.getElementById("user-table-body");
        userTableBody.innerHTML = ""; // Clear existing data

        users.forEach((user, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="deleteUser('${user.id}')">❌ Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error fetching users:", error);
    }

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        alert("✅ Logged out successfully!");
        window.location.href = "/login.html";
    });
});

// Delete user function
async function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await axios.delete(`http://localhost:8000/users/${userId}`);
            alert("✅ User deleted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("❌ Error deleting user:", error);
            alert("❌ Failed to delete user.");
        }
    }
}

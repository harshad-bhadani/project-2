document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ login.js loaded successfully!");

    // Redirect if already logged in
    if (localStorage.getItem("userLoggedIn") === "true") {
        const userType = localStorage.getItem("userType");
        window.location.href = userType === "admin" ? "/admin-dashboard.html" : "/main.html";
    }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("❌ Please enter both email and password.");
        return;
    }

    try {
        console.log("📤 Sending login request...", { email });

        const response = await axios.post("http://localhost:8000/login", 
            { email, password }, 
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Server Response:", response.data);

        if (response.status === 200) {
            const { userType } = response.data; // Expecting a 'userType' key from the server

            // Store login details in localStorage
            localStorage.setItem("userLoggedIn", "true");
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userType", userType);

            alert("✅ Login Successful! Redirecting...");

            // Redirect based on user type
            if (userType === "admin") {
                window.location.href = "/admin-dashboard.html";
            } else {
                window.location.href = "/main.html";
            }
        }
    } catch (error) {
        console.error("❌ Login Error:", error);

        if (error.response) {
            console.error("🔴 Server Response:", error.response.data);
            alert(`❌ Login Failed: ${error.response.data.message || "Unauthorized"}`);
        } else {
            alert("❌ Network error! Ensure the backend is running.");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ signup.js loaded!");
});

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("✅ Signup form submitted!");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("📤 Sending:", { name, email, password });

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
    if (!emailRegex.test(email)) {
        alert("❌ Please enter a valid email (Gmail, Yahoo, Outlook, Hotmail only).");
        return;
    }

    // Password validation
    if (password.length < 3 || password.length > 10) {
        alert("❌ Password must be between 3 and 10 characters.");
        return;
    }

    const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    console.log("🛬 Server Response:", result);

    if (response.ok) {
        alert("✅ Signup successful!");
        window.location.href = "/login";
    } else {
        alert(result.message || "❌ Signup failed");
    }
});

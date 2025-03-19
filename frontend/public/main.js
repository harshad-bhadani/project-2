document.addEventListener("DOMContentLoaded", () => {
    console.log("Main page loaded");

    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // Check if user is logged in
    if (localStorage.getItem("userLoggedIn") === "true") {
        loginBtn.style.display = "none";
        signupBtn.style.display = "none";
        logoutBtn.style.display = "block";
    } else {
        loginBtn.style.display = "block";
        signupBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }

    // Logout functionality
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("userEmail");

        loginBtn.style.display = "block";
        signupBtn.style.display = "block";
        logoutBtn.style.display = "none";

        alert("✅ Logged out successfully!");
    });

    document.querySelector(".login-btn").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    document.querySelector(".signup-btn").addEventListener("click", () => {
        window.location.href = "signup.html";
    });
});

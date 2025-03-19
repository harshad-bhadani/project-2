// backend/server.js
const express = require("express");
const db = require("./db");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/styles", express.static(path.join(__dirname, "../frontend/styles")));
app.use("/source", express.static(path.join(__dirname, "../frontend/src")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public/main.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public/signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public/login.html")));

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = password;

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        const values = [name, email, hashedPassword];

        db.promise()
            .execute(sql, values)
            .then(() => res.status(201).json({ message: "User Registered" }))
            .catch((err) => {
                console.error("Database Error:", err);
                res.status(500).json({ message: "Error inserting data" });
            });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "❌ Email and password are required" });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "❌ User not found" });
            }

            const user = results[0];

            // Compare hashed passwords (if hashed in DB)
            if (user.password !== password) {
                return res.status(401).json({ message: "❌ Incorrect password" });
            }

            res.status(200).json({
                message: "✅ Login successful",
                userType: user.userType, // Send userType (admin/user)
            });
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// ✅ Logout functionality
app.post("/logout", (req, res) => {
    res.status(200).json({ message: "✅ Logout successful" });
});

app.listen(8000, () => console.log("🚀 Server running on http://localhost:8000"));
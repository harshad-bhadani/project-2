// backend/server.js
const express = require("express");
const db = require("./db");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

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
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "../frontend/public/profile.html")));
app.use('/styles', express.static(path.join(__dirname, 'frontend/styles')));



app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: " All fields are required" });
    }

    try {
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        const values = [name.trim(), email.trim(), password.trim()];

        db.promise()
            .execute(sql, values)
            .then(() => res.status(201).json({ message: " User Registered Successfully!" }))
            .catch((err) => {
                console.error(" Database Error:", err);
                res.status(500).json({ message: " Error inserting data" });
            });
    } catch (error) {
        console.error(" Server Error:", error);
        res.status(500).json({ message: " Server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: " Email and password are required" });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email.trim()], async (err, results) => {
            if (err) {
                console.error(" Database Error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: " User not found" });
            }

            const user = results[0];

            if (user.password.trim() !== password.trim()) {
                return res.status(401).json({ message: " Incorrect password" });
            }

            res.status(200).json({
                message: " Login successful",
                userType: user.userType,
            });
        });
    } catch (error) {
        console.error(" Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/get-user", (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const sql = "SELECT id,name FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({id: results[0].id, username: results[0].name });
    });
});

app.post("/update-username", (req, res) => {
    const { email, newUsername } = req.body;

    if (!email || !newUsername) {
        return res.status(400).json({ message: "Email and new username are required" });
    }

    const sql = "UPDATE users SET name = ? WHERE email = ?";
    db.query(sql, [newUsername, email], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: " Username updated successfully!" });
    });
});

app.post("/update-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: " Email and new password are required" });
    }

    try {
        const sql = "UPDATE users SET password = ? WHERE email = ?";
        db.query(sql, [newPassword, email], (err, result) => {
            if (err) {
                console.error(" Database Error:", err);
                return res.status(500).json({ message: " Server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: " User not found" });
            }

            res.status(200).json({ message: " Password updated successfully!" });
        });
    } catch (error) {
        console.error(" Update Error:", error);
        res.status(500).json({ message: " Error updating password" });
    }
});

app.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logout successful" });
});

app.get("/api/popular-places", (req, res) => {
    db.query("SELECT * FROM popular_places", (err, results) => {
        if (err) {
            res.status(500).json({ error: "Failed to fetch places" });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/hotels', (req, res) => {
    db.query('SELECT * FROM hotels', (err, results) => {
      if (err) {
        console.error('Error fetching hotels:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  });
  
app.get("/api/hotels/:id", (req, res) => {
    const hotelId = req.params.id;
    db.query("SELECT * FROM hotels WHERE id = ?", [hotelId], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).json({ error: "Hotel not found" });
        } else {
            res.json(results[0]);
        }
    });
});

app.post("/book-hotel", async (req, res) => {
    const { user_id, hotel_id, check_in, check_out, guests, total_price } = req.body;

    if (!user_id || !hotel_id || !check_in || !check_out || !guests || !total_price) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure the check-in date is before check-out
    if (new Date(check_in) >= new Date(check_out)) {
        return res.status(400).json({ message: "Invalid check-in and check-out dates" });
    }

    try {
        await db.promise().query(
            "INSERT INTO bookings (user_id, hotel_id, check_in, check_out, guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
            [user_id, hotel_id, check_in, check_out, guests, total_price]
        );

        res.json({ message: "Booking successful!" });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
});

//booking packages

app.post("/book-package", async (req, res) => {
    const { user_id, package_id, booking_date } = req.body;

    console.log("🔹 Booking request received:", { user_id, package_id, booking_date });

    if (!user_id || !package_id || !booking_date) {
        console.error(" Missing required fields.");
        return res.status(400).json({ success: false, message: " Missing required fields" });
    }

    try {
        const [packageResult] = await db.promise().query(
            "SELECT price FROM packages WHERE id = ?",
            [package_id]
        );

        if (packageResult.length === 0) {
            return res.status(404).json({ success: false, message: " Package not found" });
        }

        const total_price = packageResult[0].price;
        console.log(`Package Price Found: $${total_price}`);

        await db.promise().query(
            "INSERT INTO package_bookings (user_id, package_id, total_price, status, booking_date) VALUES (?, ?, ?, 'Pending', ?)",
            [user_id, package_id, total_price, booking_date]
        );

        console.log(" Package booked successfully.");
        res.json({ success: true, message: " Package booked successfully!", total_price });
    } catch (error) {
        console.error(" Booking error:", error);
        res.status(500).json({ success: false, message: " Server error. Please try again later." });
    }
});

app.get("/get-package-price", async (req, res) => {
    const { package_id } = req.query;

    if (!package_id) {
        return res.status(400).json({ success: false, message: " Package ID is required" });
    }

    try {
        const [packageResult] = await db.promise().query(
            "SELECT price FROM packages WHERE id = ?",
            [package_id]
        );

        if (packageResult.length === 0) {
            return res.status(404).json({ success: false, message: " Package not found" });
        }

        res.json({ success: true, price: packageResult[0].price });
    } catch (error) {
        console.error(" Error fetching package price:", error);
        res.status(500).json({ success: false, message: " Server error. Try again later." });
    }
});



//Admin backend 
/// Get all users
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ message: "Failed to fetch users" });
      }
      res.json(results);
    });
  });
  
  // Get hotel bookings with joined data
  app.get("/hotel-bookings", (req, res) => {
    const sql = `
      SELECT b.id, u.name AS user_name, u.email AS user_email, h.name AS hotel_name,
             b.check_in, b.check_out, b.guests, b.total_price, b.status
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN hotels h ON b.hotel_id = h.id
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching bookings:", err);
        return res.status(500).json({ message: "Failed to fetch bookings" });
      }
      res.json(results);
    });
  });
  
  // Delete user
  app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Failed to delete user" });
      }
      res.json({ message: "User deleted" });
    });
  });
  
  // Delete booking
  app.delete("/delete-booking/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM bookings WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting booking:", err);
        return res.status(500).json({ message: "Failed to delete booking" });
      }
      res.json({ message: "Booking deleted" });
    });
  });
  

  // admin packages
  
// Get all packages
app.get("/packages", (req, res) => {
    db.query("SELECT id, user_id, package_id, total_price,status FROM package_bookings", (err, results) => {
      if (err) {
        console.error("Error fetching packages:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });
  
  // Delete a package
  app.delete("/packages/:id", (req, res) => {
    const packageId = req.params.id;
    db.query("DELETE FROM package_bookings WHERE id = ?", [packageId], (err) => {
      if (err) {
        console.error("Error deleting package:", err);
        return res.status(500).json({ error: "Delete failed" });
      }
      res.json({ success: true });
    });
  });
  
  // add apckages and hotel from admin pannel

  app.post("/add-package", (req, res) => {
    const { name, destination, duration, description, image_url, price } = req.body;
  
    if (!name || !destination || !duration || !description || !image_url || !price) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
  
    const insertQuery = `
      INSERT INTO packages (name, destination, duration, description, image_url, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(insertQuery, [name, destination, duration, description, image_url, price], (err, result) => {
      if (err) {
        console.error("Error inserting package:", err);
        return res.status(500).json({ message: "Error adding package" });
      }
      res.json({ message: "Package added successfully!" });
    });
  });
  

app.post("/add-hotel", (req, res) => {
    const { name, location, image_url, price_per_night, amenities } = req.body;
    const sql = "INSERT INTO hotels (name, location, image_url, price_per_night, amenities) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, location, image_url, price_per_night, amenities], (err, result) => {
        if (err) {
            console.error("Error adding hotel:", err);
            return res.status(500).json({ message: " Failed to add hotel." });
        }
        res.json({ message: " Hotel added successfully!" });
    });
});

//admin hotels delete
app.delete("/hotels/:id", (req, res) => {
    const hotelId = req.params.id;

    const deleteQuery = "DELETE FROM hotels WHERE id = ?";
    db.query(deleteQuery, [hotelId], (err, result) => {
        if (err) {
            console.error("Error deleting hotel:", err);
            return res.status(500).json({ message: "Failed to delete hotel" });
        }

        res.status(200).json({ message: "Hotel deleted successfully" });
    });
});

app.get('/hotels', (req, res) => {
    const sql = 'SELECT * FROM hotels';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching hotels:', err);
        return res.status(500).json({ error: 'Failed to fetch hotels' });
      }
      res.json(results);
    });
  });
  
  //admin package
  // 🔹 Get all packages
app.get('/package', (req, res) => {
    const query = 'SELECT * FROM packages';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching packages:', err);
        return res.status(500).json({ message: 'Error retrieving packages' });
      }
      res.json(results);
    });
  });
  
  // 🔹 Delete a package by ID
app.delete('/package/:id', (req, res) => {
    const packageId = req.params.id;
  
    const deleteQuery = 'DELETE FROM packages WHERE id = ?';
    db.query(deleteQuery, [packageId], (err, result) => {
      if (err) {
        console.error('Error deleting package:', err);
        return res.status(500).json({ message: 'Failed to delete package' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      res.json({ message: 'Package deleted successfully' });
    });
  });
  



  // GET hotel bookings by user ID
app.get('/get-hotel-bookings/:userId', (req, res) => {
    const userId = req.params.userId;
    db.query('SELECT * FROM bookings INNER JOIN hotels ON bookings.hotel_id = hotels.id WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching hotel bookings' });
      res.json(results);
    });
  });
  
  //package profile
  app.get('/get-package-bookings/:userId', (req, res) => {
    const userId = req.params.userId;
  
    const query = `
      SELECT package_bookings.id, packages.name AS package_name, package_bookings.status
      FROM package_bookings
      INNER JOIN packages ON package_bookings.package_id = packages.id
      WHERE package_bookings.user_id = ?
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching package bookings' });
      }
      res.json(results);
    });
  });
  
  
  
// Cancel booking API
app.put('/cancel-booking/:type/:bookingId', (req, res) => {
    const { type, bookingId } = req.params;
    const query = `UPDATE bookings SET status = 'canceled' WHERE id = ?`;
  
    db.query(query, [bookingId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Cancel failed' });
      res.json({ message: `${type} booking canceled successfully` });
    });
  });

  // Cancel hotel booking
app.delete('/cancel-hotel-booking/:id', async (req, res) => {
    const bookingId = req.params.id;
    try {
      await db.execute(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel hotel booking' });
    }
  });
  
  // Cancel package booking
  app.delete('/cancel-package-booking/:id', async (req, res) => {
    const bookingId = req.params.id;
    try {
      await db.execute(`DELETE FROM package_bookings WHERE id = ?`, [bookingId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel package booking' });
    }
  });
  
  


app.listen(8000, () => console.log("🚀 Server running on http://localhost:8000"));

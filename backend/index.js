require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const User = require("./models/User");

const app = express();

// Middleware
const corsOptions = {
  origin: 'https://employee-management-system-theta-lac.vercel.app'|| process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}; 

app.use(cors(corsOptions));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Current configuration
app.use("/uploads", express.static(uploadsDir));

// Add console logging to debug path
console.log("Uploads directory path:", uploadsDir);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
module.exports.upload = upload;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Check for default admin user
    const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME;
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    const adminUser = await User.findOne({ userName: defaultAdminUsername });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, salt);
      const newAdminUser = new User({ userName: defaultAdminUsername, password: hashedPassword });
      await newAdminUser.save();
      console.log("Default admin user created");
    } 
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.use("/", (req, res) => {
  res.json({ message: "Welcome to the Employee Management API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

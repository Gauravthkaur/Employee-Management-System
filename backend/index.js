require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT;
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Set up multer for file uploads

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});


const upload = multer({ storage: storage });
module.exports.upload = upload;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
  .then(async () => {
    console.log('MongoDB connected');

    // Check if default admin user exists and create if not
    const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME;
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    console.log('Admin username:', process.env.DEFAULT_ADMIN_USERNAME);
    console.log('Admin password:', process.env.DEFAULT_ADMIN_PASSWORD);

    const adminUser = await User.findOne({ userName: defaultAdminUsername });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, salt);
      const newAdminUser = new User({
        userName: defaultAdminUsername,
        password: hashedPassword,
      });
      await newAdminUser.save();
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
  })
  .catch((err) => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
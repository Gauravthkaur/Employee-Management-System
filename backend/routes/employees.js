const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new employee
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    let imagePath = '';
    if (req.file) {
      // File was uploaded
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newEmployee = new Employee({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      designation: req.body.designation,
      gender: req.body.gender,
      course: req.body.course, // Now a single string, not an array
      image: imagePath,
    });

    console.log('New employee object:', newEmployee);

    const employee = await newEmployee.save();
    res.json(employee);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update employee
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
  try {
    console.log('Updating employee with ID:', req.params.id);
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    let courseData;
    try {
      courseData = JSON.parse(req.body.course);
    } catch (error) {
      console.error('Error parsing course data:', error);
      courseData = req.body.course || [];
    }

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      designation: req.body.designation,
      gender: req.body.gender,
      course: courseData,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    console.log('Update data:', updateData);

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    console.log('Updated employee:', updatedEmployee);
    res.json(updatedEmployee);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Attempting to delete employee with ID:', req.params.id);
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found with ID:', req.params.id);
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    await Employee.findOneAndDelete(req.params.id);  // Changed from findByIdAndRemove
    
    console.log('Successfully deleted employee with ID:', req.params.id);
    res.json({ msg: 'Employee removed' });
  } catch (err) {
    console.error('Error in delete route:', err);
    res.status(500).json({
      msg: 'Server Error',
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  }
});

module.exports = router;
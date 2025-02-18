const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
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
    
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;

    }

    const newEmployee = new Employee({
      ...req.body,
      image: imagePath
    });

    const employee = await newEmployee.save();
    console.log('Saved employee:', employee);
    res.json(employee);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
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
    const employeeId = req.params.id;
    const updateData = { ...req.body };
    
    // Find existing employee
    const oldEmployee = await Employee.findById(employeeId);
    if (!oldEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (oldEmployee.image) {
        const oldImagePath = path.join(__dirname, '..', oldEmployee.image);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.warn('Error deleting old image:', err);
        }
      }
      // Set new image path
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Update employee
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    );

    res.json(employee);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
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


router.get('/debug', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees.map(emp => ({
    id: emp._id,
    name: emp.name,
    imagePath: emp.image
  })));
});

module.exports = router;
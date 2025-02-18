// src/components/CreateEmployee.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CreateEmployee = () => {
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    mobile: '',
    designation: '',
    gender: '',
    course: '',
    image: null,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (files && files[0]) {
        console.log('File selected:', files[0]);
        setEmployee(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Log form data for debugging
    console.log('Form data before submit:', employee);

    Object.keys(employee).forEach(key => {
      if (key === 'image' && employee[key]) {
        console.log('Adding image to form:', employee[key]);
        formData.append('image', employee[key]);
      } else if (employee[key]) {
        formData.append(key, employee[key]);
      }
    });

    try {
      const response = await axios.post(`${API_URL}/api/employees`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      navigate('/employees');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Employee
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={employee.name}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={employee.email}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Mobile"
          name="mobile"
          value={employee.mobile}
          onChange={handleChange}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Designation</InputLabel>
          <Select
            name="designation"
            value={employee.designation}
            onChange={handleChange}
            required
          >
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
          </Select>
        </FormControl>
        <FormControl component="fieldset" margin="normal">
          <RadioGroup
            row
            name="gender"
            value={employee.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Course</InputLabel>
          <Select
            name="course"
            value={employee.course}
            onChange={handleChange}
            required
          >
            <MenuItem value="MCA">MCA</MenuItem>
            <MenuItem value="BCA">BCA</MenuItem>
            <MenuItem value="BSC">BSC</MenuItem>
            <MenuItem value="BSC">BTech</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ margin: '20px 0' }}>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button 
              variant="outlined" 
              component="span"
              fullWidth
            >
              {employee.image ? 'Change Image' : 'Upload Image'}
            </Button>
          </label>
          {employee.image && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {employee.image.name}
            </Typography>
          )}
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create Employee
        </Button>
      </form>
    </Box>
  );
};

export default CreateEmployee;
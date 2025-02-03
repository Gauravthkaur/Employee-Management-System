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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setEmployee(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(employee).forEach(key => {
      if (key === 'image' && employee[key]) {
        formData.append(key, employee[key], employee[key].name);
      } else {
        formData.append(key, employee[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/employees`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server response:', response.data);
      navigate('/employees');
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Employee
      </Typography>
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
          </Select>
        </FormControl>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          accept="image/*"
          style={{ margin: '10px 0' }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create Employee
        </Button>
      </form>
    </Box>
  );
};

export default CreateEmployee;
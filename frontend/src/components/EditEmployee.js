import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert,
} from '@mui/material';

const EditEmployee = () => {
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    mobile: '',
    designation: '',
    gender: '',
    course: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        console.log('Fetching employee with ID:', id);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employees/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        console.log('Received employee data:', res.data);
        setEmployee(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Failed to fetch employee data. Please try again.');
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
  
    // Handle file inputs
    if (type === 'file') {
      setEmployee(prev => ({ ...prev, [name]: files[0] }));
    } 
    // Handle the 'course' field as a single selection input
    else if (name === 'course') {
      setEmployee(prev => ({ ...prev, [name]: value })); // Just set the value directly
    } 
    // Handle other fields (text inputs, etc.)
    else {
      setEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in employee) {
      if (employee[key] !== null && employee[key] !== undefined) {
        if (Array.isArray(employee[key])) {
          employee[key].forEach(value => formData.append(key, value));
        } else {
          formData.append(key, employee[key]);
        }
      }
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/employees/${id}`, formData, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/employees');
    } catch (err) {
      console.error(err);
      setError('Failed to update employee. Please try again.');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Edit Employee
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            name="name"
            value={employee.name}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Email"
            variant="outlined"
            name="email"
            value={employee.email}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Mobile"
            variant="outlined"
            name="mobile"
            value={employee.mobile}
            onChange={handleChange}
            required
            fullWidth
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
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
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControl component="fieldset">
            <Typography component="legend">Gender</Typography>
            <RadioGroup
              name="gender"
              value={employee.gender}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
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
        </Box>
        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Update Employee
        </Button>
      </form>
    </Box>
  );
};

export default EditEmployee;
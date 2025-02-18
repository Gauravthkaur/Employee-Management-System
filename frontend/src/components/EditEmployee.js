import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const fetchEmployee = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/employees/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.data) {
        setEmployee(res.data);
        if (res.data.image) {
          setImagePreview(`${API_URL}${res.data.image}`);
        }
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError(err.response?.data?.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
  
    // Handle file inputs
    if (type === 'file') {
      if (files && files[0]) {
        const file = files[0];
        setEmployee(prev => ({ ...prev, [name]: file }));
        // Create preview URL for the new image
        setImagePreview(URL.createObjectURL(file));
      }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setEmployee(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
  
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    
    // Add all text fields
    Object.keys(employee).forEach(key => {
      if (key !== 'image' && employee[key]) {
        formData.append(key, employee[key]);
      }
    });
    
    // Add image only if a new one is selected
    if (employee.image instanceof File) {
      formData.append('image', employee.image);
    }
  
    try {
      const response = await axios.put(`${API_URL}/api/employees/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update response:', response.data);
      await fetchEmployee();
      navigate('/employees');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '40px auto', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Edit Employee
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
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
          <Box sx={{ mb: 3 }}>
            {imagePreview && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={imagePreview}
                  alt="Employee"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            )}
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUploadIcon />}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Employee'
            )}
          </Button>
        </form>
      )}
    </Box>
  );
};

export default EditEmployee;
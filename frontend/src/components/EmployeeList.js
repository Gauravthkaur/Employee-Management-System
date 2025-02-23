import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './styles/style.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = process.env.REACT_APP_API_URL || 'https://employee-management-system-9sj4.onrender.com';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const navigate = useNavigate();

  // Function to sort employees by creation date (newest first)
  const sortEmployeesByDate = (employeesArray) => {
    return [...employeesArray].sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    });
  };

  const getImageUrl = (imagePath, employeeId) => {
    if (imageLoadErrors[employeeId]) {
      return '/placeholder.png';
    }

    if (!imagePath) return '/placeholder.png';
    
    if (imagePath.startsWith('http')) return imagePath;
    
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_URL}${normalizedPath}`;
  };

  const handleImageError = (employeeId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [employeeId]: true
    }));
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/employees`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.data) {
          setImageLoadErrors({});
          // Sort employees before setting state
          const sortedEmployees = sortEmployeesByDate(res.data);
          setEmployees(sortedEmployees);
          setFilteredEmployees(sortedEmployees);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [navigate]);

  useEffect(() => {
    if (!employees || !searchTerm) {
      // Ensure the filtered list is also sorted
      setFilteredEmployees(sortEmployeesByDate(employees));
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = employees.filter(employee => (
      employee.mobile?.toLowerCase().includes(term) ||
      employee.name?.toLowerCase().includes(term) ||
      employee._id?.toLowerCase().includes(term) ||
      employee.email?.toLowerCase().includes(term) ||
      (employee.createdDate ? new Date(employee.createdDate).toLocaleDateString().toLowerCase().includes(term) : false) ||
      employee.course?.toLowerCase().includes(term)
    ));
    // Sort the filtered results
    setFilteredEmployees(sortEmployeesByDate(results));
  }, [searchTerm, employees]);

  const deleteEmployee = async (id) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
  
    try {
      const response = await axios.delete(`${API_URL}/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        const updatedEmployees = employees.filter(emp => emp._id !== id);
        // Sort the updated list
        const sortedEmployees = sortEmployeesByDate(updatedEmployees);
        setEmployees(sortedEmployees);
        setFilteredEmployees(sortedEmployees);
        alert('Employee deleted successfully');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 404) {
        alert('Employee not found');
        const updatedEmployees = employees.filter(emp => emp._id !== id);
        setEmployees(sortEmployeesByDate(updatedEmployees));
        setFilteredEmployees(sortEmployeesByDate(updatedEmployees));
      } else {
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee List
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Link to="/create-employee" style={{ textDecoration: 'none' }}>
          <Button variant="contained">Create Employee</Button>
        </Link>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Unique ID</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>
                  <div className='logo-container' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={getImageUrl(employee.image, employee._id)}
                      alt={employee.name}
                      onError={() => handleImageError(employee._id)}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '1px solid #ddd'
                      }}
                    />
                    <div>{employee.name}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.mobile}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>{employee.course}</TableCell>
                <TableCell>{employee._id}</TableCell>
                <TableCell>{new Date(employee.createdDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/edit-employee/${employee._id}`)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteEmployee(employee._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>  
  );
};

export default EmployeeList;
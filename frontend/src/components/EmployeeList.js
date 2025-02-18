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
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const Uploadapi = process.env.REACT_APP_UPLOAD_API || 'http://localhost:5000/uploads';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${API_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/employees`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.data) {
          console.log('Fetched Employees:', res.data); // Debugging employee image paths
          setEmployees(res.data);
          setFilteredEmployees(res.data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError(err.response?.data?.message || 'Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, [navigate]);

  useEffect(() => {
    if (!employees || !searchTerm) {
      setFilteredEmployees(employees);
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
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const deleteEmployee = async (id) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/employees/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp._id !== id));
      setFilteredEmployees(prevEmployees => prevEmployees.filter(emp => emp._id !== id));
      alert('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      alert(error.response?.data?.message || 'Failed to delete employee');
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
            {filteredEmployees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>
                  <div className='logo-container'>
                    <img 
                      src={getImageUrl(employee.image)}
                      alt={employee.name}
                      onError={(e) => {
                        console.warn(`Error loading image for ${employee.name}:`, employee.image);
                        e.target.src = '/placeholder.png';
                      }}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '50%'
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

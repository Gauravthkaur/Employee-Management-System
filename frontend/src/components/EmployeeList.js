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

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employees`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log(res.data)
      setEmployees(res.data);
      setFilteredEmployees(res.data);
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!employees || !searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const results = employees.filter(employee => {
      const  name= employee.name?.toLowerCase()?? '';
      const id = employee._id?.toLowerCase() ?? '';
      const email = employee.email?.toLowerCase() ?? '';
      const createdDate = employee.createdDate ? new Date(employee.createdDate).toLocaleDateString() : '';
      const course = employee.course?.toLowerCase() ?? '';
      const term = searchTerm.toLowerCase();
      

      return id.includes(term) || 
             email.includes(term) || 
             createdDate.toLowerCase().includes(term) ||
             name.toLowerCase().includes(term)||
             course.includes(term);
    });
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/employees/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp._id !== id));
      alert('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error.response ? error.response.data : error.message);
      alert('Failed to delete employee');
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
                    <img src="/user-512.png" alt="logo" />
                    <div>{employee.name}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.mobile}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell>{employee.course} </TableCell>
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
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const Dashboard = () => {
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
        Welcome Admin Panel
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Link to="/employees" style={{ textDecoration: 'none' }}>
          <Button variant="contained">Employee List</Button>
        </Link>
        <Link to="/create-employee" style={{ textDecoration: 'none', marginLeft: '16px' }}>
          <Button variant="contained">Create Employee</Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Dashboard;
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import CreateEmployee from './components/CreateEmployee';
import EditEmployee from './components/EditEmployee';
import Navigation from './components/Navigation';

const theme = createTheme();

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <>
      <Navigation />
      {children}
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute><EmployeeList /></PrivateRoute>} />
          <Route path="/create-employee" element={<PrivateRoute><CreateEmployee /></PrivateRoute>} />
          <Route path="/edit-employee/:id" element={<PrivateRoute><EditEmployee /></PrivateRoute>} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './Context/AuthContext';
import PrivateRoute from './componant/PrivateRoute';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
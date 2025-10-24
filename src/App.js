import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginForm from './components/LoginForm';
import MainApp from './MainApp';
import Reports from './components/Reports';
import AdvancedReports from './components/AdvancedReports';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

// Componente de la aplicación principal
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CustomerProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/advanced-reports" element={<AdvancedReports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<MainApp />} />
            </Routes>
          </Router>
        </CustomerProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
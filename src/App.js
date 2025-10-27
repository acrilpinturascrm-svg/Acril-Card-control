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
import PublicCustomerCard from './components/PublicCustomerCard';

// Componente de la aplicación principal
const App = () => {
  // Configurar basename para GitHub Pages
  const basename = process.env.NODE_ENV === 'production' 
    ? '/Acril-Card-control' 
    : '';

  return (
    <AuthProvider>
      <NotificationProvider>
        <CustomerProvider>
          <Router basename={basename}>
            <Routes>
              {/* Ruta pública para tarjeta de cliente - NO requiere autenticación */}
              <Route path="/card" element={<PublicCustomerCard />} />
              
              {/* Todas las rutas son públicas - Login opcional solo para backup */}
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
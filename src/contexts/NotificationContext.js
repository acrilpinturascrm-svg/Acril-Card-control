import React, { createContext, useState, useCallback, useContext } from 'react';
import Notification from '../components/common/Notification'; // Import the Notification component

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showError = useCallback((message) => {
    setNotification({ message, type: 'error' });
    // Notification component handles auto-closing, so no need for setTimeout here
  }, []);

  const showSuccess = useCallback((message) => {
    setNotification({ message, type: 'success' });
    // Notification component handles auto-closing, so no need for setTimeout here
  }, []);

  const showWarning = useCallback((message) => {
    setNotification({ message, type: 'warning' });
  }, []);

  const showInfo = useCallback((message) => {
    setNotification({ message, type: 'info' });
  }, []);

  // Generic API to display any notification with options
  const showNotification = useCallback(({ message, type = 'info', position, autoClose, autoCloseDuration } = {}) => {
    setNotification({ message, type, position, autoClose, autoCloseDuration });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{
        notification,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showNotification,
        closeNotification
      }}
    >
      {children}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={closeNotification}
          position={notification.position}
          autoClose={notification.autoClose}
          autoCloseDuration={notification.autoCloseDuration}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

export default NotificationContext;
// Exportar también como export nombrado para compatibilidad con componentes de test
export { NotificationContext };

import { useState, useEffect, useCallback } from 'react';
import useAutoBackup from './useAutoBackup';
import { useCustomers } from '../contexts/CustomerContext';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';

const useBackupAlert = () => {
  const [alertState, setAlertState] = useState({
    isVisible: false,
    type: 'warning', // 'warning', 'urgent', 'success', 'info'
    title: '',
    message: '',
    lastDismissed: null,
    snoozeUntil: null
  });

  const { backupHistory, getBackupStats } = useAutoBackup();
  const { customers } = useCustomers();
  const { role } = useAuth();

  // Configuración de intervalos (en días)
  const INTERVALS = {
    WARNING_DAYS: 1, // Cambiado de 7 a 1 para que aparezca más frecuentemente
    URGENT_DAYS: 3,  // Cambiado de 14 a 3 para testing
    SNOOZE_HOURS: 1,
    DISMISS_HOURS: 24
  };

  // Configuración diferenciada por rol
  const isAdmin = role === USER_ROLES.ADMIN;
  const isEmployee = role === USER_ROLES.EMPLOYEE;

  // Calcular días desde último backup
  const getDaysSinceLastBackup = useCallback(() => {
    if (!backupHistory || backupHistory.length === 0) {
      return 2; // Si no hay backups, simular 2 días para activar alerta
    }

    const lastBackup = backupHistory[backupHistory.length - 1];
    const lastBackupDate = new Date(lastBackup.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - lastBackupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [backupHistory]);

  // Verificar si la alerta debe mostrarse (diferenciado por rol)
  const shouldShowAlert = useCallback(() => {
    const now = new Date();
    
    // ADMIN: Verificar dismiss permanente PRIMERO
    if (isAdmin) {
      const permanentDismiss = localStorage.getItem('backup_alert_permanent_dismiss_admin');
      if (permanentDismiss === 'true') {
        return false; // No mostrar más al admin si dismissó permanentemente
      }
    }
    
    // No mostrar si está en snooze
    if (alertState.snoozeUntil && now < new Date(alertState.snoozeUntil)) {
      return false;
    }

    // Verificar dismiss temporal (SOLO para admin)
    if (alertState.lastDismissed && isAdmin) {
      const dismissTime = new Date(alertState.lastDismissed);
      const hoursSinceDismiss = (now - dismissTime) / (1000 * 60 * 60);
      
      // Solo admin puede tener dismiss temporal
      if (hoursSinceDismiss < INTERVALS.DISMISS_HOURS) {
        return false;
      }
    }

    const daysSinceBackup = getDaysSinceLastBackup();
    
    // Debug temporal
    console.log('🔍 Verificando alerta:', {
      role,
      daysSinceBackup,
      warningDays: INTERVALS.WARNING_DAYS,
      shouldShow: daysSinceBackup >= INTERVALS.WARNING_DAYS
    });
    
    // Mostrar si han pasado más de 1 día
    return daysSinceBackup >= INTERVALS.WARNING_DAYS;
  }, [alertState.snoozeUntil, alertState.lastDismissed, getDaysSinceLastBackup, INTERVALS, isAdmin]);

  // Determinar tipo y mensaje de alerta
  const getAlertContent = useCallback(() => {
    const daysSinceBackup = getDaysSinceLastBackup();
    const stats = getBackupStats();

    if (daysSinceBackup === Infinity) {
      return {
        type: 'urgent',
        title: '🚨 ¡Backup Necesario!',
        message: 'No tienes backups. Tus datos podrían perderse.',
        priority: 'high'
      };
    }

    if (daysSinceBackup >= INTERVALS.URGENT_DAYS) {
      return {
        type: 'urgent',
        title: '🚨 ¡Backup Urgente!',
        message: `Han pasado ${daysSinceBackup} días desde tu último backup.`,
        priority: 'high'
      };
    }

    if (daysSinceBackup >= INTERVALS.WARNING_DAYS) {
      return {
        type: 'warning',
        title: '⚠️ Backup Recomendado',
        message: `Último backup hace ${daysSinceBackup} días. ${customers.length} clientes sin respaldar.`,
        priority: 'medium'
      };
    }

    return null;
  }, [getDaysSinceLastBackup, getBackupStats, customers.length, INTERVALS]);

  // Mostrar alerta de éxito después de backup
  const showSuccessAlert = useCallback((message = 'Backup completado exitosamente') => {
    // Resetear dismiss permanente del admin después de backup exitoso
    if (isAdmin) {
      localStorage.removeItem('backup_alert_permanent_dismiss_admin');
    }

    setAlertState(prev => ({
      ...prev,
      isVisible: true,
      type: 'success',
      title: '✅ Backup Completado',
      message,
      priority: 'low'
    }));

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      setAlertState(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  }, [isAdmin]);

  // Función snooze (declarada PRIMERO)
  const snoozeAlert = useCallback((hours = INTERVALS.SNOOZE_HOURS) => {
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);
    
    setAlertState(prev => ({
      ...prev,
      isVisible: false,
      snoozeUntil: snoozeUntil.toISOString()
    }));
  }, [INTERVALS.SNOOZE_HOURS]);

  // Acciones de la alerta (diferenciadas por rol)
  const dismissAlert = useCallback(() => {
    if (isAdmin) {
      // ADMIN: Dismiss permanente - no vuelve a aparecer
      localStorage.setItem('backup_alert_permanent_dismiss_admin', 'true');
      setAlertState(prev => ({
        ...prev,
        isVisible: false,
        lastDismissed: new Date().toISOString()
      }));
    } else if (isEmployee) {
      // EMPLEADO: NO puede dismissar, solo snooze por 1 hora
      snoozeAlert(1);
    }
  }, [isAdmin, isEmployee, snoozeAlert]);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Función para resetear dismiss permanente (solo para emergencias)
  const resetPermanentDismiss = useCallback(() => {
    localStorage.removeItem('backup_alert_permanent_dismiss_admin');
  }, []);

  // Efecto unificado para verificar y mostrar alertas
  useEffect(() => {
    const checkAndShowAlert = () => {
      // No mostrar si ya está visible para evitar duplicación
      if (alertState.isVisible) {
        return;
      }

      if (shouldShowAlert()) {
        const content = getAlertContent();
        if (content) {
          setAlertState(prev => ({
            ...prev,
            isVisible: true,
            ...content
          }));
        }
      }
    };

    // Verificar después de un pequeño delay para evitar múltiples ejecuciones
    const timeout = setTimeout(checkAndShowAlert, 500); // Reducido de 1000ms a 500ms

    // Verificar cada 30 minutos
    const interval = setInterval(checkAndShowAlert, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [shouldShowAlert, getAlertContent, alertState.isVisible]);

  return {
    // Estado
    isVisible: alertState.isVisible,
    type: alertState.type,
    title: alertState.title,
    message: alertState.message,
    
    // Acciones
    dismissAlert,
    snoozeAlert,
    hideAlert,
    showSuccessAlert,
    
    // Utilidades
    daysSinceLastBackup: getDaysSinceLastBackup(),
    shouldShowAlert: shouldShowAlert(),
    resetPermanentDismiss
  };
};

export default useBackupAlert;

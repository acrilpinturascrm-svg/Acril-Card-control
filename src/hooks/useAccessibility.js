import { useState, useEffect, useCallback } from 'react';

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusVisible: true
  });

  useEffect(() => {
    // Detectar preferencias del sistema
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mediaQueryContrast = window.matchMedia('(prefers-contrast: high)');
    const mediaQueryFontSize = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: mediaQueryMotion.matches,
        highContrast: mediaQueryContrast.matches,
        fontSize: getFontSizePreference()
      }));
    };

    const getFontSizePreference = () => {
      if (window.innerWidth < 640) return 'small';
      if (window.innerWidth > 1280) return 'large';
      return 'medium';
    };

    // Actualizar inmediatamente
    updatePreferences();

    // Escuchar cambios
    mediaQueryMotion.addEventListener('change', updatePreferences);
    mediaQueryContrast.addEventListener('change', updatePreferences);
    window.addEventListener('resize', updatePreferences);

    return () => {
      mediaQueryMotion.removeEventListener('change', updatePreferences);
      mediaQueryContrast.removeEventListener('change', updatePreferences);
      window.removeEventListener('resize', updatePreferences);
    };
  }, []);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));

    // Guardar en localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('acrilcard-accessibility') || '{}');
      localStorage.setItem('acrilcard-accessibility', JSON.stringify({
        ...saved,
        [key]: value
      }));
    } catch (error) {
      console.warn('Could not save accessibility preferences:', error);
    }
  }, []);

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('acrilcard-accessibility') || '{}');
      setPreferences(prev => ({ ...prev, ...saved }));
    } catch (error) {
      console.warn('Could not load accessibility preferences:', error);
    }
  }, []);

  return {
    preferences,
    updatePreference,
    // Utilidades específicas
    isReducedMotion: preferences.reducedMotion,
    isHighContrast: preferences.highContrast,
    fontSize: preferences.fontSize,
    isFocusVisible: preferences.focusVisible
  };
};

export const useKeyboardNavigation = () => {
  const [currentFocus, setCurrentFocus] = useState(null);

  const handleKeyDown = useCallback((event) => {
    const { key, target } = event;

    switch (key) {
      case 'Tab':
        setCurrentFocus(target);
        break;

      case 'Escape':
        // Cerrar modales o dropdowns
        if (target.blur) {
          target.blur();
        }
        break;

      case 'Enter':
      case ' ':
        // Activar botones o enlaces
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          target.click();
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        // Navegación en listas o menús
        event.preventDefault();
        const focusableElements = Array.from(document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && !el.hidden);

        const currentIndex = focusableElements.indexOf(target);
        if (currentIndex !== -1) {
          const nextIndex = key === 'ArrowDown'
            ? Math.min(currentIndex + 1, focusableElements.length - 1)
            : Math.max(currentIndex - 1, 0);
          focusableElements[nextIndex]?.focus();
        }
        break;

      default:
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentFocus,
    handleKeyDown
  };
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeScreen: false,
    orientation: 'landscape'
  });

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width >= height ? 'landscape' : 'portrait';

    setScreenSize({
      width,
      height,
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024 && width < 1280,
      isLargeScreen: width >= 1280,
      orientation
    });
  }, []);

  useEffect(() => {
    updateScreenSize();

    const handleResize = () => updateScreenSize();
    const handleOrientationChange = () => {
      // Pequeño delay para permitir que el navegador actualice las dimensiones
      setTimeout(updateScreenSize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Escuchar cambios en media queries
    const mediaQueries = [
      { query: '(max-width: 639px)', key: 'isMobile' },
      { query: '(min-width: 640px) and (max-width: 1023px)', key: 'isTablet' },
      { query: '(min-width: 1024px) and (max-width: 1279px)', key: 'isDesktop' },
      { query: '(min-width: 1280px)', key: 'isLargeScreen' }
    ];

    const mqls = mediaQueries.map(({ query, key }) => ({
      mql: window.matchMedia(query),
      key,
      handler: (e) => {
        setScreenSize(prev => ({ ...prev, [key]: e.matches }));
      }
    }));

    mqls.forEach(({ mql, handler }) => {
      mql.addEventListener('change', handler);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mqls.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler);
      });
    };
  }, [updateScreenSize]);

  const getBreakpointClasses = useCallback(() => {
    const { isMobile, isTablet, isDesktop, isLargeScreen } = screenSize;

    if (isMobile) return 'sm:max-w-sm';
    if (isTablet) return 'md:max-w-2xl';
    if (isDesktop) return 'lg:max-w-4xl';
    if (isLargeScreen) return 'xl:max-w-6xl';
    return 'max-w-7xl';
  }, [screenSize]);

  return {
    ...screenSize,
    getBreakpointClasses,
    isSmallScreen: screenSize.isMobile || screenSize.isTablet,
    isLargeScreen: screenSize.isDesktop || screenSize.isLargeScreen
  };
};

export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Detectar tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      const savedTheme = localStorage.getItem('acrilcard-theme');

      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setTheme(savedTheme === 'auto' ? systemTheme : savedTheme);
      } else {
        setTheme('auto');
        localStorage.setItem('acrilcard-theme', 'auto');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('acrilcard-theme', newTheme);

    // Aplicar clases CSS
    document.documentElement.classList.remove('light', 'dark');
    if (newTheme !== 'auto') {
      document.documentElement.classList.add(newTheme);
    }
  }, []);

  return {
    theme,
    changeTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isAuto: theme === 'auto'
  };
};

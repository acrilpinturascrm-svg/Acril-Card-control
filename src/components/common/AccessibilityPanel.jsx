import React, { useState } from 'react';
import { Settings, Eye, Type, MousePointer, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './common';
import { useAccessibility, useTheme } from '../hooks/useAccessibility';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreference } = useAccessibility();
  const { theme, changeTheme } = useTheme();

  const handleReducedMotionChange = (enabled) => {
    updatePreference('reducedMotion', enabled);
    // Aplicar inmediatamente
    document.documentElement.style.setProperty(
      '--animation-duration',
      enabled ? '0.01ms' : '200ms'
    );
  };

  const handleHighContrastChange = (enabled) => {
    updatePreference('highContrast', enabled);
    // Aplicar inmediatamente
    document.documentElement.classList.toggle('high-contrast', enabled);
  };

  const handleFontSizeChange = (size) => {
    updatePreference('fontSize', size);
    // Aplicar inmediatamente
    const multipliers = { small: 0.875, medium: 1, large: 1.125 };
    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      multipliers[size] || 1
    );
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white border-white hover:bg-white hover:text-red-800"
        aria-label="Configuración de accesibilidad"
        title="Configuración de accesibilidad"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de Accesibilidad
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* Reducción de movimiento */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <MousePointer className="w-4 h-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Reducir animaciones</div>
                    <div className="text-sm text-gray-600">Desactiva animaciones y transiciones</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reducedMotion}
                  onChange={(e) => handleReducedMotionChange(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  aria-describedby="motion-help"
                />
              </label>
              <p id="motion-help" className="sr-only">
                Activa esta opción si prefieres interfaces sin animaciones o transiciones
              </p>
            </div>

            {/* Alto contraste */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Alto contraste</div>
                    <div className="text-sm text-gray-600">Mejora la visibilidad con colores más intensos</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.highContrast}
                  onChange={(e) => handleHighContrastChange(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  aria-describedby="contrast-help"
                />
              </label>
              <p id="contrast-help" className="sr-only">
                Activa el modo de alto contraste para mejor visibilidad
              </p>
            </div>

            {/* Tamaño de fuente */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Type className="w-4 h-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Tamaño de fuente</div>
                    <div className="text-sm text-gray-600">Ajusta el tamaño del texto</div>
                  </div>
                </div>
                <select
                  value={preferences.fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-describedby="font-help"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </label>
              <p id="font-help" className="sr-only">
                Selecciona el tamaño de fuente que prefieras
              </p>
            </div>

            {/* Tema */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-3 text-gray-600">
                    {theme === 'light' && <Sun />}
                    {theme === 'dark' && <Moon />}
                    {theme === 'auto' && <Monitor />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Tema de color</div>
                    <div className="text-sm text-gray-600">Elige cómo se ve la aplicación</div>
                  </div>
                </div>
                <select
                  value={theme}
                  onChange={(e) => changeTheme(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-describedby="theme-help"
                >
                  <option value="light">🌞 Claro</option>
                  <option value="dark">🌙 Oscuro</option>
                  <option value="auto">🔄 Automático</option>
                </select>
              </label>
              <p id="theme-help" className="sr-only">
                Selecciona el tema de color: claro, oscuro o automático según tu sistema
              </p>
            </div>

            {/* Indicador de foco visible */}
            <div>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <MousePointer className="w-4 h-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">Enfoque visible</div>
                    <div className="text-sm text-gray-600">Muestra el indicador de foco al navegar con teclado</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.focusVisible}
                  onChange={(e) => updatePreference('focusVisible', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  aria-describedby="focus-help"
                />
              </label>
              <p id="focus-help" className="sr-only">
                Mantén activado para ver claramente qué elemento está seleccionado al navegar con teclado
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Resetear todas las preferencias
                updatePreference('reducedMotion', false);
                updatePreference('highContrast', false);
                updatePreference('fontSize', 'medium');
                updatePreference('focusVisible', true);
                changeTheme('auto');
              }}
              className="w-full"
            >
              Restablecer valores por defecto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;

import React from 'react';

const SkipNavigation = () => {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50">
      <nav
        className="bg-white border-b-2 border-red-800 shadow-lg p-2"
        role="navigation"
        aria-label="Navegación de accesibilidad"
      >
        <ul className="flex space-x-4">
          <li>
            <a
              href="#main-content"
              className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Saltar al contenido principal
            </a>
          </li>
          <li>
            <a
              href="#customer-list"
              className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Ir a lista de clientes
            </a>
          </li>
          <li>
            <a
              href="#customer-form"
              className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Ir al formulario
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SkipNavigation;

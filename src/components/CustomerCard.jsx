import React from 'react';
import { Gift, Star } from 'lucide-react';
import { useCustomers } from '../contexts/CustomerContext';
import { getProgressPercentage } from '../utils/logic';

const CustomerCard = ({ customerCode }) => {
  const { customers } = useCustomers();

  // Buscar el cliente por código
  const customer = customers.find(c => c.code === customerCode);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-4">
            No se pudo encontrar un cliente con el código: <strong>{customerCode}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Verifica que el código sea correcto o contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const stampsPerReward = 10; // Esto debería venir del contexto o configuración
  const totalStamps = customer.stamps || 0;
  const currentStamps = totalStamps % stampsPerReward;
  const totalRewards = Math.floor(totalStamps / stampsPerReward);
  const progressPercentage = getProgressPercentage(totalStamps, stampsPerReward);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Tarjeta principal */}
        <div className="bg-gradient-to-br from-red-800 to-yellow-600 rounded-2xl shadow-xl p-8 text-center text-white border-4 border-yellow-500">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
              ACRILCARD
            </h1>
            <h2 className="text-2xl font-semibold text-black mb-2">{customer.name}</h2>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg mx-4">
              <p className="text-sm opacity-90">Código de Cliente</p>
              <p className="text-lg font-bold tracking-wider">{customer.code}</p>
            </div>
            <p className="text-sm opacity-90 mt-2">Cédula: {customer.cedula}</p>
          </div>

          {/* Contador de sellos */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-5 mb-8 border border-yellow-400 border-opacity-30">
            <p className="text-yellow-200 text-lg font-medium mb-1">Sellos Acumulados</p>
            <p className="text-5xl font-bold text-white">{totalStamps}</p>
            <p className="text-yellow-200 text-sm mt-1">
              {currentStamps} / {stampsPerReward} para el próximo premio
            </p>
          </div>

          {/* Barra de progreso de sellos */}
          <div className="mb-8">
            <div className="flex justify-between text-yellow-100 text-sm mb-2">
              <span>Progreso</span>
              <span className="font-semibold">{currentStamps} / {stampsPerReward}</span>
            </div>
            <div className="w-full bg-black bg-opacity-20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Sellos visuales */}
          <div className="mb-8">
            <p className="text-yellow-200 text-sm font-medium mb-3">Tus sellos</p>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(stampsPerReward)].map((_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 ${
                    i < currentStamps
                      ? 'bg-yellow-400 text-yellow-800 transform scale-105 shadow-lg'
                      : 'bg-white bg-opacity-10 border-2 border-dashed border-yellow-400 border-opacity-30'
                  }`}
                >
                  {i < currentStamps ? '✪' : '○'}
                </div>
              ))}
            </div>

            {/* Indicador de progreso */}
            <div className="mt-4 flex justify-center">
              <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
                <span className="text-yellow-200 text-sm">
                  Faltan {stampsPerReward - currentStamps} sellos para completar
                </span>
              </div>
            </div>
          </div>

          {/* Premios disponibles */}
          {totalRewards > 0 && (
            <div className="bg-yellow-400 text-red-900 p-4 rounded-lg mb-6 border-2 border-yellow-600">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Gift className="w-6 h-6" />
                <span className="font-bold text-lg">¡Felicidades!</span>
              </div>
              <p className="font-medium">
                Tienes <strong>{totalRewards}</strong> premio{totalRewards !== 1 ? 's' : ''} disponible{totalRewards !== 1 ? 's' : ''}
              </p>
              <p className="text-sm mt-1 opacity-80">
                ¡Acércate a la tienda para canjearlo!
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">Total Compras</p>
              <p className="text-xl font-bold">{customer.totalPurchases || 0}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm opacity-90">Premios Ganados</p>
              <p className="text-xl font-bold">{totalRewards}</p>
            </div>
          </div>

          {/* Fecha de última compra */}
          {customer.lastPurchase && (
            <div className="mt-4 text-center">
              <p className="text-sm opacity-75">Última compra</p>
              <p className="font-medium">{new Date(customer.lastPurchase).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Información de contacto */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-2">¿Tienes dudas sobre tu tarjeta?</p>
            <p className="text-sm text-gray-800">
              <strong>Teléfono:</strong> {customer.phone}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Presenta esta tarjeta en la tienda para acumular sellos
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Sistema de Fidelización ACRIL - {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;

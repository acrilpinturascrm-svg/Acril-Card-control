import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Award, Star, Gift, Calendar, ShoppingBag } from 'lucide-react';

/**
 * Componente público para mostrar la tarjeta de fidelidad del cliente
 * No requiere autenticación - accesible desde enlaces de WhatsApp
 */
const PublicCustomerCard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stampsPerReward, setStampsPerReward] = useState(10);

  useEffect(() => {
    const loadCustomer = () => {
      try {
        // Obtener parámetro customer de la URL
        const customerParam = searchParams.get('customer');
        
        console.log('🔍 Buscando cliente con parámetro:', customerParam);
        
        if (!customerParam) {
          setError('No se especificó un cliente en el enlace.');
          setLoading(false);
          return;
        }

        // Cargar clientes desde localStorage
        const stored = localStorage.getItem('customers');
        if (!stored) {
          console.error('❌ No hay datos en localStorage');
          setError('No se encontraron datos de clientes. Asegúrate de que la aplicación tenga clientes registrados.');
          setLoading(false);
          return;
        }

        const customers = JSON.parse(stored);
        console.log('📋 Total de clientes en localStorage:', customers.length);
        
        // Buscar cliente por código o ID
        const foundCustomer = customers.find(c => {
          const matchCode = c.code === customerParam;
          const matchId = c.id === customerParam;
          console.log(`Comparando: ${c.code} === ${customerParam} (${matchCode}) || ${c.id} === ${customerParam} (${matchId})`);
          return matchCode || matchId;
        });

        if (!foundCustomer) {
          console.error('❌ Cliente no encontrado. Parámetro:', customerParam);
          console.log('Códigos disponibles:', customers.map(c => c.code).join(', '));
          setError(`Cliente no encontrado. Código buscado: ${customerParam}`);
          setLoading(false);
          return;
        }

        console.log('✅ Cliente encontrado:', foundCustomer.name, foundCustomer.code);
        setCustomer(foundCustomer);

        // Cargar configuración de sellos
        const savedStamps = localStorage.getItem('stampsPerReward');
        if (savedStamps) {
          setStampsPerReward(parseInt(savedStamps, 10));
        }

        setLoading(false);
      } catch (err) {
        console.error('💥 Error al cargar cliente:', err);
        setError('Error al cargar los datos del cliente: ' + err.message);
        setLoading(false);
      }
    };

    loadCustomer();
  }, [searchParams]);

  // Calcular estadísticas
  const totalStamps = customer?.stamps || 0;
  const currentStamps = totalStamps % stampsPerReward;
  const totalRewards = Math.floor(totalStamps / stampsPerReward);
  const stampsNeeded = stampsPerReward - currentStamps;
  const progressPercentage = (currentStamps / stampsPerReward) * 100;

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando tu tarjeta...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tarjeta no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de tu tarjeta.'}</p>
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, contacta con el negocio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-yellow-600 rounded-full mb-4 shadow-lg">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tu Tarjeta de Fidelidad
          </h1>
          <p className="text-gray-600">ACRIL Pinturas</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header de la tarjeta */}
          <div className="bg-gradient-to-r from-red-600 to-yellow-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Cliente</p>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Código</p>
                <p className="text-lg font-mono font-bold">{customer.code}</p>
              </div>
            </div>
            
            {/* Premios disponibles */}
            {totalRewards > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-6 h-6" />
                  <span className="text-xl font-bold">
                    {totalRewards} Premio{totalRewards > 1 ? 's' : ''} Disponible{totalRewards > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-center text-sm mt-2 opacity-90">
                  ¡Canjéalos en tu próxima visita!
                </p>
              </div>
            )}
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6">
            {/* Progreso de sellos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso actual
                </span>
                <span className="text-sm font-bold text-red-600">
                  {currentStamps} / {stampsPerReward} sellos
                </span>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-yellow-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              {currentStamps > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  ¡Te faltan <span className="font-bold text-red-600">{stampsNeeded}</span> sellos para tu próximo premio!
                </p>
              )}
            </div>

            {/* Visualización de sellos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Tarjeta Actual
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: stampsPerReward }).map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                      index < currentStamps
                        ? 'bg-gradient-to-br from-red-600 to-yellow-600 shadow-md scale-105'
                        : 'bg-gray-100 border-2 border-dashed border-gray-300'
                    }`}
                  >
                    {index < currentStamps ? (
                      <Star className="w-6 h-6 text-white fill-current" />
                    ) : (
                      <Star className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {totalStamps}
                </div>
                <div className="text-sm text-gray-600">Sellos Totales</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {totalRewards}
                </div>
                <div className="text-sm text-gray-600">Premios Ganados</div>
              </div>
            </div>

            {/* Historial de compras */}
            {customer.purchaseHistory && customer.purchaseHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-red-600" />
                  Últimas Compras
                </h3>
                <div className="space-y-2">
                  {customer.purchaseHistory.slice(-5).reverse().map((purchase, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(purchase.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {purchase.amount > 0 && (
                          <span className="text-sm font-medium text-gray-900">
                            ${purchase.amount.toLocaleString()}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          +{purchase.stamps} sellos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            ¡Gracias por tu preferencia! 💚
          </p>
          <p className="text-xs text-gray-500">
            Sigue acumulando sellos y obtén más premios
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCustomerCard;

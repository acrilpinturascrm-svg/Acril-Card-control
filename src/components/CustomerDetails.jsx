import React, { useState, useCallback } from 'react';
import { User, Plus, Minus, Award, ShoppingBag, Calendar, Trash2, Copy, MessageCircle, Gift, Star } from 'lucide-react';
import { InputAdornment, Fade } from '@mui/material';
import { Button, InputField } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNotification } from '../contexts/NotificationContext';
import { enviarTarjetaPorWhatsApp } from '../utils/whatsapp';
import { getPublicBaseUrl } from '../utils/publicUrl';
import { getProgressPercentage } from '../utils/logic';
import { generateCustomerLink } from '../utils/customerDataEncoder';
import { replaceTemplateVariables } from '../utils/templateVariables';
import WhatsAppPreviewModal from './WhatsAppPreviewModal';

const CustomerStats = React.memo(({ customer, stampsPerReward }) => {
  if (!customer) return null;

  const totalStamps = customer.stamps || 0;
  const currentStamps = totalStamps % stampsPerReward;
  const totalRewards = Math.floor(totalStamps / stampsPerReward);
  const progressPercentage = getProgressPercentage(totalStamps, stampsPerReward);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-red-800" />
          <span className="text-sm text-gray-600">Sellos actuales</span>
        </div>
        <div className="text-2xl font-bold text-red-800 flex items-center">
          <span className="inline-block w-8 text-right">{currentStamps}</span>
          <span> / {stampsPerReward}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-red-800 to-yellow-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">Premios disponibles</span>
        </div>
        <div className="text-2xl font-bold text-green-600">{totalRewards}</div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Total compras</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">{customer.totalPurchases || 0}</div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-gray-600">Última compra</span>
        </div>
        <div className="text-sm font-semibold text-yellow-600">
          {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Nunca'}
        </div>
      </div>
    </div>
  );
});

CustomerStats.displayName = 'CustomerStats';

const StampControls = React.memo(({
  customer,
  stampsPerReward,
  onAddStamp,
  onRemoveStamp,
  onRedeemReward,
  loading
}) => {
  if (!customer) return null;

  const totalStamps = customer.stamps || 0;
  const currentStamps = totalStamps % stampsPerReward;
  const totalRewards = Math.floor(totalStamps / stampsPerReward);
  
  // Estados para el modal de WhatsApp
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const { showSuccess, showError } = useNotification();
  
  // Función para generar el mensaje de WhatsApp usando plantillas
  const generateWhatsAppMessage = useCallback(() => {
    const businessName = localStorage.getItem('whatsapp_business_name') || 'ACRIL Pinturas';
    const baseUrl = getPublicBaseUrl();
    const linkTarjeta = `${baseUrl}/card?c=${encodeURIComponent(customer.code)}`;
    
    // Cargar plantillas guardadas
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    let templates = [];
    
    if (savedTemplates) {
      try {
        templates = JSON.parse(savedTemplates);
      } catch (error) {
        console.error('Error al cargar plantillas:', error);
      }
    }
    
    // Seleccionar plantilla según el contexto
    let selectedTemplate;
    const isNewCustomer = totalStamps === 0;
    const hasReward = totalRewards > 0;
    const isAtDiscount = currentStamps === 5 || currentStamps === 7;
    
    if (isNewCustomer) {
      // Cliente nuevo - usar plantilla de bienvenida
      selectedTemplate = templates.find(t => t.id === 'welcome');
    } else if (hasReward) {
      // Tiene premio completo - usar plantilla de premio completo
      selectedTemplate = templates.find(t => t.id === 'reward_complete');
    } else if (isAtDiscount) {
      // Está en posición de descuento - usar plantilla de descuento
      selectedTemplate = templates.find(t => t.id === 'discount_5_7');
    } else {
      // Compra recurrente - usar plantilla de compra
      selectedTemplate = templates.find(t => t.id === 'stamps_added');
    }
    
    // Si no hay plantilla guardada, usar mensaje por defecto
    if (!selectedTemplate) {
      // Fallback al mensaje básico
      const sellosFaltantes = stampsPerReward - currentStamps;
      let mensaje = `¡Hola ${customer.name}! 👋\n\n`;
      mensaje += `En Acril premiamos tu fidelidad, por eso le compartimos su avance de la tarjeta Acrilcard que por cada compra en tienda tendrá en su progreso una serie de descuentos del 5% para todos nuestros productos en los puestos 5 y 7 y en el puesto 10 un 5% + obsequio, que la disfrute al máximo, y además, ya contamos con Cashea, somos Acril economía de lujo!\n\n`;
      mensaje += `🎯 Tu tarjeta de fidelidad:\n`;
      mensaje += `📍 Sellos actuales: ${totalStamps}\n`;
      if (currentStamps > 0) {
        mensaje += `⭐ En tu tarjeta actual: ${currentStamps}/${stampsPerReward}\n`;
        mensaje += `🎯 Te faltan ${sellosFaltantes} sellos para tu próximo premio\n`;
      }
      mensaje += `\n📱 Ver tu tarjeta completa:\n${linkTarjeta}\n\n`;
      mensaje += `¡Sigue acumulando sellos! 🎉`;
      return mensaje;
    }
    
    // Usar plantilla con reemplazo de variables
    const templateData = {
      customerName: customer.name,
      businessName: businessName,
      totalStamps: totalStamps,
      stampsPerReward: stampsPerReward,
      currentStamps: currentStamps,
      totalRewards: totalRewards,
      link: linkTarjeta
    };
    
    return replaceTemplateVariables(selectedTemplate.message, templateData);
  }, [customer, currentStamps, totalStamps, totalRewards, stampsPerReward]);

  const handleAddStamp = useCallback(() => {
    if (onAddStamp) {
      onAddStamp(customer.id);
    }
  }, [customer.id, onAddStamp]);

  const handleRemoveStamp = useCallback(() => {
    if (onRemoveStamp) {
      onRemoveStamp(customer.id);
    }
  }, [customer.id, onRemoveStamp]);

  const handleRedeemReward = useCallback(() => {
    if (onRedeemReward) {
      onRedeemReward(customer.id);
    }
  }, [customer.id, onRedeemReward]);

  const handleWhatsApp = useCallback(() => {
    const message = generateWhatsAppMessage();
    setWhatsappMessage(message);
    setShowWhatsAppModal(true);
  }, [generateWhatsAppMessage]);
  
  const handleSendWhatsApp = useCallback(async (finalMessage) => {
    try {
      const result = enviarTarjetaPorWhatsApp(
        customer.phone || '',
        customer.name || '',
        customer.id || '',
        {
          sellos: currentStamps,
          stamps: totalStamps,
          stampsPerReward: stampsPerReward,
          purchaseHistory: customer.purchaseHistory || [],
          customMessage: finalMessage,
          customerCode: customer.code
        }
      );
      
      if (result) {
        showSuccess('✅ Mensaje enviado por WhatsApp');
        
        // Guardar en el historial (si está disponible en el contexto padre)
        if (window.addWhatsAppHistoryGlobal) {
          window.addWhatsAppHistoryGlobal(customer.id, {
            template: 'custom',
            status: 'sent',
            message: finalMessage
          });
        }
      }
    } catch (error) {
      console.error('Error al enviar WhatsApp:', error);
      showError('❌ Error al enviar mensaje');
      
      // Guardar error en el historial
      if (window.addWhatsAppHistoryGlobal) {
        window.addWhatsAppHistoryGlobal(customer.id, {
          template: 'custom',
          status: 'error',
          message: finalMessage,
          error: error.message
        });
      }
    }
  }, [customer, currentStamps, totalStamps, stampsPerReward, showSuccess, showError]);

  const handleCopyLink = useCallback(async () => {
    try {
      const baseUrl = getPublicBaseUrl();
      const link = generateCustomerLink(baseUrl, customer);
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }, [customer]);

  return (
    <div className="space-y-6">
      {/* Acciones principales */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 flex space-x-2">
          <Button
            variant="primary"
            onClick={handleAddStamp}
            loading={loading}
            className="flex-1 py-3"
            disabled={!customer}
          >
            {loading ? 'Agregando...' : 'Agregar Sello'}
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveStamp}
            disabled={!customer || currentStamps <= 0}
            loading={loading}
            className="py-3"
            title="Quitar último sello"
          >
            <Minus className="w-5 h-5" />
          </Button>
        </div>

        {totalRewards > 0 && (
          <Button
            variant="success"
            onClick={handleRedeemReward}
            loading={loading}
            className="flex-1 py-3"
          >
            {loading ? 'Canjeando...' : 'Canjear Premio'}
          </Button>
        )}
      </div>

      {/* Acciones secundarias */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex-1 py-2"
          title="Copiar enlace del cliente"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar Enlace
        </Button>

        <Button
          variant="outline"
          onClick={handleWhatsApp}
          className="flex-1 py-2"
          title="Enviar tarjeta por WhatsApp"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>
      
      {/* Modal de Vista Previa de WhatsApp */}
      <WhatsAppPreviewModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSend={handleSendWhatsApp}
        customerName={customer.name}
        customerPhone={customer.phone}
        message={whatsappMessage}
        onMessageChange={setWhatsappMessage}
        customerData={{
          customerName: customer.name,
          businessName: localStorage.getItem('whatsapp_business_name') || 'ACRIL Pinturas',
          totalStamps: totalStamps,
          stampsPerReward: stampsPerReward,
          currentStamps: currentStamps,
          totalRewards: totalRewards,
          link: `${getPublicBaseUrl()}/card?c=${encodeURIComponent(customer.code)}`
        }}
      />
    </div>
  );
});

StampControls.displayName = 'StampControls';

const CustomerDetails = ({
  customer,
  stampsPerReward = 10,
  onEdit,
  onDelete,
  onClose
}) => {
  const { updateCustomer, loading } = useCustomers();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddStamp = useCallback(async (customerId, purchaseAmount = 0) => {
    try {
      const newStamps = customer.stamps + 1;
      const newRewards = Math.floor(newStamps / stampsPerReward);

      const purchase = {
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        amount: purchaseAmount,
        stampNumber: newStamps
      };

      await updateCustomer(customerId, {
        stamps: newStamps,
        totalPurchases: customer.totalPurchases + 1,
        lastPurchase: new Date().toISOString(),
        rewardsEarned: newRewards,
        purchaseHistory: [...customer.purchaseHistory, purchase]
      });

      // Notificar si está cerca de un premio
      const sellosFaltantes = stampsPerReward - (newStamps % stampsPerReward);
      if (sellosFaltantes === 1) {
        showSuccess('¡Estás a 1 sello del premio!');
      } else if (sellosFaltantes <= 3 && sellosFaltantes > 0) {
        showSuccess(`¡Solo faltan ${sellosFaltantes} sellos para tu premio!`);
      }
    } catch (error) {
      showError('Error al agregar sello');
    }
  }, [customer, stampsPerReward, updateCustomer, showSuccess, showError]);

  const handleRemoveStamp = useCallback(async (customerId) => {
    try {
      if (customer.stamps <= 0) return;

      const newStamps = customer.stamps - 1;
      const newRewards = Math.floor(newStamps / stampsPerReward);

      await updateCustomer(customerId, {
        stamps: newStamps,
        totalPurchases: Math.max(0, customer.totalPurchases - 1),
        rewardsEarned: newRewards,
        purchaseHistory: customer.purchaseHistory.slice(0, -1)
      });
    } catch (error) {
      showError('Error al quitar sello');
    }
  }, [customer, stampsPerReward, updateCustomer, showError]);

  const handleRedeemReward = useCallback(async (customerId) => {
    try {
      if (customer.stamps < stampsPerReward) return;

      const newStamps = customer.stamps - stampsPerReward;
      const newRewards = Math.floor(newStamps / stampsPerReward);

      const redeemedReward = {
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        stampsUsed: stampsPerReward,
        rewardType: 'Premio estándar'
      };

      await updateCustomer(customerId, {
        stamps: newStamps,
        rewardsEarned: newRewards,
        redeemedRewards: [...(customer.redeemedRewards || []), redeemedReward]
      });

      showSuccess('¡Premio canjeado exitosamente! Revisa el historial.');
    } catch (error) {
      showError('Error al canjear premio');
    }
  }, [customer, stampsPerReward, updateCustomer, showSuccess, showError]);

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      onDelete(customer.id);
    }
  }, [customer.id, onDelete]);

  if (!customer) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Selecciona un cliente para ver sus detalles</p>
      </div>
    );
  }

  return (
    <Fade in={!!customer} timeout={500}>
      <div>
        {/* Header del cliente */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-red-800" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
              <p className="text-gray-600">{customer.phone}</p>
              <p className="text-gray-600 text-sm">
                {customer.idType} - {customer.idNumber}
              </p>
              <p className="text-yellow-600 font-semibold text-sm">Código: {customer.code}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
              title="Agregar nuevo cliente"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="icon"
              onClick={handleDelete}
              size="sm"
              className="text-red-500 hover:bg-red-50"
              title="Eliminar cliente"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <CustomerStats customer={customer} stampsPerReward={stampsPerReward} />

        {/* Controles */}
        <StampControls
          customer={customer}
          stampsPerReward={stampsPerReward}
          onAddStamp={handleAddStamp}
          onRemoveStamp={handleRemoveStamp}
          onRedeemReward={handleRedeemReward}
          loading={loading}
        />

        {/* Pestañas de información */}
        <div className="mt-6">
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Resumen', icon: User },
                { id: 'history', label: 'Historial', icon: ShoppingBag },
                { id: 'rewards', label: 'Premios', icon: Gift }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === id
                      ? 'border-red-800 text-red-800'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Información Personal</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nombre:</strong> {customer.name}</div>
                  <div><strong>Teléfono:</strong> {customer.phone}</div>
                  <div><strong>Cédula:</strong> {customer.cedula}</div>
                  <div><strong>Código:</strong> {customer.code}</div>
                  <div><strong>Fecha de Registro:</strong> {new Date(customer.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total de Sellos:</strong> {customer.stamps}</div>
                  <div><strong>Premios Ganados:</strong> {Math.floor(customer.stamps / stampsPerReward)}</div>
                  <div><strong>Compras Totales:</strong> {customer.totalPurchases}</div>
                  <div><strong>Última Compra:</strong> {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Nunca'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Historial de Compras</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
                  customer.purchaseHistory.slice().reverse().map((purchase) => (
                    <div key={purchase.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Sello #{purchase.stampNumber}</div>
                        <div className="text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</div>
                      </div>
                      {purchase.amount > 0 && (
                        <div className="text-green-600 font-semibold">
                          ${purchase.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No hay compras registradas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Historial de Premios Canjeados</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {customer.redeemedRewards && customer.redeemedRewards.length > 0 ? (
                  customer.redeemedRewards.slice().reverse().map((reward) => (
                    <div key={reward.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-green-800">{reward.rewardType}</div>
                        <div className="text-sm text-gray-600">{new Date(reward.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-green-600 font-semibold">
                        {reward.stampsUsed} sellos
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No hay premios canjeados</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Fade>
  );
};

export default CustomerDetails;

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Clock,
  Star,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

const AdvancedReports = () => {
  const { customers } = useCustomers();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Análisis avanzado de datos
  const advancedAnalytics = useMemo(() => {
    const now = new Date();
    
    // Segmentación de clientes
    const segments = {
      champions: customers.filter(c => (c.stamps || 0) >= 15 && (c.rewards || 0) >= 2),
      loyalists: customers.filter(c => (c.stamps || 0) >= 10 && (c.rewards || 0) >= 1),
      potential: customers.filter(c => (c.stamps || 0) >= 5 && (c.stamps || 0) < 10),
      newcomers: customers.filter(c => (c.stamps || 0) >= 1 && (c.stamps || 0) < 5),
      inactive: customers.filter(c => (c.stamps || 0) === 0)
    };

    // Análisis de retención
    const retentionAnalysis = {
      totalCustomers: customers.length,
      activeRate: ((customers.length - segments.inactive.length) / customers.length * 100).toFixed(1),
      retentionScore: (segments.champions.length + segments.loyalists.length) / customers.length * 100,
      churnRisk: segments.inactive.length / customers.length * 100
    };

    // Análisis de comportamiento
    const behaviorAnalysis = {
      avgStampsPerCustomer: (customers.reduce((sum, c) => sum + (c.stamps || 0), 0) / customers.length).toFixed(1),
      avgRewardsPerCustomer: (customers.reduce((sum, c) => sum + (c.rewards || 0), 0) / customers.length).toFixed(1),
      conversionRate: ((customers.filter(c => (c.rewards || 0) > 0).length / customers.length) * 100).toFixed(1),
      engagementScore: ((segments.champions.length * 5 + segments.loyalists.length * 4 + segments.potential.length * 3 + segments.newcomers.length * 2) / customers.length).toFixed(1)
    };

    // Análisis temporal
    const temporalAnalysis = {
      thisMonth: customers.filter(c => {
        const created = new Date(c.createdAt || c.dateAdded || Date.now());
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      lastMonth: customers.filter(c => {
        const created = new Date(c.createdAt || c.dateAdded || Date.now());
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
      }).length,
      growthRate: 0
    };
    
    temporalAnalysis.growthRate = temporalAnalysis.lastMonth > 0 
      ? ((temporalAnalysis.thisMonth - temporalAnalysis.lastMonth) / temporalAnalysis.lastMonth * 100).toFixed(1)
      : 100;

    // Predicciones y recomendaciones
    const predictions = {
      projectedGrowth: Math.round(temporalAnalysis.thisMonth * 1.2),
      potentialRevenue: segments.potential.length * 0.8, // Asumiendo conversión del 80%
      riskCustomers: segments.inactive.length,
      opportunities: segments.newcomers.length + segments.potential.length
    };

    return {
      segments,
      retentionAnalysis,
      behaviorAnalysis,
      temporalAnalysis,
      predictions
    };
  }, [customers]);

  // Generar reporte PDF/Excel simulado
  const generateAdvancedReport = (format = 'json') => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      totalCustomers: customers.length,
      segmentation: {
        champions: advancedAnalytics.segments.champions.length,
        loyalists: advancedAnalytics.segments.loyalists.length,
        potential: advancedAnalytics.segments.potential.length,
        newcomers: advancedAnalytics.segments.newcomers.length,
        inactive: advancedAnalytics.segments.inactive.length
      },
      kpis: advancedAnalytics.behaviorAnalysis,
      retention: advancedAnalytics.retentionAnalysis,
      predictions: advancedAnalytics.predictions,
      detailedCustomers: customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        stamps: customer.stamps || 0,
        rewards: customer.rewards || 0,
        segment: getCustomerSegment(customer),
        value: calculateCustomerValue(customer),
        riskLevel: calculateRiskLevel(customer),
        createdAt: customer.createdAt || customer.dateAdded
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-avanzado-acrilcard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCustomerSegment = (customer) => {
    const stamps = customer.stamps || 0;
    const rewards = customer.rewards || 0;
    
    if (stamps >= 15 && rewards >= 2) return 'Champion';
    if (stamps >= 10 && rewards >= 1) return 'Loyalist';
    if (stamps >= 5 && stamps < 10) return 'Potential';
    if (stamps >= 1 && stamps < 5) return 'Newcomer';
    return 'Inactive';
  };

  const calculateCustomerValue = (customer) => {
    const stamps = customer.stamps || 0;
    const rewards = customer.rewards || 0;
    return (stamps * 1.5 + rewards * 10).toFixed(1);
  };

  const calculateRiskLevel = (customer) => {
    const stamps = customer.stamps || 0;
    if (stamps === 0) return 'Alto';
    if (stamps < 3) return 'Medio';
    return 'Bajo';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes Avanzados</h1>
                <p className="text-gray-600">Análisis profundo y segmentación de clientes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="all">Todo el tiempo</option>
              </select>
              
              <Button 
                onClick={() => generateAdvancedReport('json')} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Avanzado
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs Avanzados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Score de Engagement</p>
                <p className="text-3xl font-bold">{advancedAnalytics.behaviorAnalysis.engagementScore}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-purple-100 text-sm mt-2">
              Nivel de compromiso general
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tasa de Retención</p>
                <p className="text-3xl font-bold">{advancedAnalytics.retentionAnalysis.activeRate}%</p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-green-100 text-sm mt-2">
              Clientes activos vs total
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tasa de Conversión</p>
                <p className="text-3xl font-bold">{advancedAnalytics.behaviorAnalysis.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-blue-100 text-sm mt-2">
              Clientes que han canjeado
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Crecimiento Mensual</p>
                <p className="text-3xl font-bold">{advancedAnalytics.temporalAnalysis.growthRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-orange-200" />
            </div>
            <p className="text-orange-100 text-sm mt-2">
              Comparado con mes anterior
            </p>
          </div>
        </div>

        {/* Segmentación de Clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Segmentación de Clientes
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Champions', count: advancedAnalytics.segments.champions.length, color: 'bg-green-500', desc: 'Clientes más valiosos' },
                { name: 'Loyalists', count: advancedAnalytics.segments.loyalists.length, color: 'bg-blue-500', desc: 'Clientes leales' },
                { name: 'Potential', count: advancedAnalytics.segments.potential.length, color: 'bg-yellow-500', desc: 'Potencial de crecimiento' },
                { name: 'Newcomers', count: advancedAnalytics.segments.newcomers.length, color: 'bg-purple-500', desc: 'Clientes nuevos' },
                { name: 'Inactive', count: advancedAnalytics.segments.inactive.length, color: 'bg-red-500', desc: 'Requieren atención' }
              ].map((segment) => (
                <div key={segment.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${segment.color}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{segment.name}</p>
                      <p className="text-sm text-gray-600">{segment.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                    <p className="text-sm text-gray-600">
                      {((segment.count / customers.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predicciones y Oportunidades */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Predicciones y Oportunidades
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Crecimiento Proyectado</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{advancedAnalytics.predictions.projectedGrowth}</p>
                <p className="text-sm text-blue-700">Clientes estimados próximo mes</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Potencial de Conversión</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{advancedAnalytics.predictions.potentialRevenue}</p>
                <p className="text-sm text-green-700">Clientes listos para canjear</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Clientes en Riesgo</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{advancedAnalytics.predictions.riskCustomers}</p>
                <p className="text-sm text-red-700">Requieren estrategia de reactivación</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Oportunidades</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{advancedAnalytics.predictions.opportunities}</p>
                <p className="text-sm text-purple-700">Clientes con potencial de crecimiento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis Detallado */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Análisis Detallado por Cliente</h3>
              <Button
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                variant="outline"
                size="sm"
              >
                {showDetailedAnalysis ? 'Ocultar' : 'Mostrar'} Detalles
              </Button>
            </div>
          </div>
          
          {showDetailedAnalysis && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Segmento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Sellos</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Recompensas</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 20).map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-gray-600">{customer.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getCustomerSegment(customer) === 'Champion' ? 'bg-green-100 text-green-800' :
                            getCustomerSegment(customer) === 'Loyalist' ? 'bg-blue-100 text-blue-800' :
                            getCustomerSegment(customer) === 'Potential' ? 'bg-yellow-100 text-yellow-800' :
                            getCustomerSegment(customer) === 'Newcomer' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getCustomerSegment(customer)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{customer.stamps || 0}</td>
                        <td className="py-3 px-4 font-medium">{customer.rewards || 0}</td>
                        <td className="py-3 px-4 font-medium">{calculateCustomerValue(customer)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            calculateRiskLevel(customer) === 'Alto' ? 'bg-red-100 text-red-800' :
                            calculateRiskLevel(customer) === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {calculateRiskLevel(customer)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customers.length > 20 && (
                  <div className="text-center py-4 text-gray-500">
                    Mostrando 20 de {customers.length} clientes. Exporta el reporte para ver todos.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Zap,
  Target,
  Users,
  Award,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft
} from 'lucide-react';
import { Button } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { customers } = useCustomers();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('overview');

  // Análisis de tendencias y métricas avanzadas
  const analyticsData = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(timeRange);
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Filtrar datos por rango de tiempo
    const filteredCustomers = customers.filter(customer => {
      const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
      return createdDate >= startDate;
    });

    // Métricas principales
    const totalCustomers = customers.length;
    const newCustomers = filteredCustomers.length;
    const totalStamps = customers.reduce((sum, c) => sum + (c.stamps || 0), 0);
    const totalRewards = customers.reduce((sum, c) => sum + (c.rewards || 0), 0);
    const activeCustomers = customers.filter(c => (c.stamps || 0) > 0).length;

    // Tendencias diarias (últimos 30 días)
    const dailyTrends = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayCustomers = customers.filter(customer => {
        const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
        return createdDate.toDateString() === date.toDateString();
      }).length;

      dailyTrends.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        customers: dayCustomers,
        cumulative: customers.filter(customer => {
          const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
          return createdDate <= date;
        }).length
      });
    }

    // Análisis de comportamiento por horas
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const count = customers.filter(customer => {
        const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
        return createdDate.getHours() === hour;
      }).length;
      return { hour, count };
    });

    // Distribución por días de la semana
    const weeklyDistribution = Array.from({ length: 7 }, (_, day) => {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const count = customers.filter(customer => {
        const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
        return createdDate.getDay() === day;
      }).length;
      return { day: dayNames[day], count };
    });

    // Análisis de cohortes (simplificado)
    const cohortAnalysis = {
      week1: customers.filter(c => (c.stamps || 0) >= 1).length,
      week2: customers.filter(c => (c.stamps || 0) >= 3).length,
      week3: customers.filter(c => (c.stamps || 0) >= 5).length,
      week4: customers.filter(c => (c.stamps || 0) >= 8).length
    };

    // Métricas de rendimiento
    // Calcular tiempo promedio hasta primera recompensa (en días)
    const customersWithRewards = customers.filter(c => (c.rewards || 0) > 0);
    let avgDaysToFirstReward = 0;
    if (customersWithRewards.length > 0) {
      const totalDays = customersWithRewards.reduce((sum, customer) => {
        const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
        const now = new Date();
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0);
      avgDaysToFirstReward = (totalDays / customersWithRewards.length).toFixed(1);
    }

    // Calcular frecuencia de visitas (sellos por mes activo)
    const avgStampsPerMonth = totalCustomers > 0 ? ((totalStamps / totalCustomers) * 30 / 365).toFixed(1) : 0;

    const performanceMetrics = {
      avgStampsPerCustomer: totalCustomers > 0 ? (totalStamps / totalCustomers).toFixed(2) : 0,
      conversionRate: totalCustomers > 0 ? ((customers.filter(c => (c.rewards || 0) > 0).length / totalCustomers) * 100).toFixed(1) : 0,
      engagementRate: totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : 0,
      avgDaysToFirstReward: avgDaysToFirstReward || 'N/A',
      avgStampsPerMonth: avgStampsPerMonth
    };

    // Comparación con período anterior
    const previousPeriod = customers.filter(customer => {
      const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
      const previousStart = new Date(startDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      return createdDate >= previousStart && createdDate < startDate;
    });

    const comparison = {
      customers: {
        current: newCustomers,
        previous: previousPeriod.length,
        change: previousPeriod.length > 0 ? (((newCustomers - previousPeriod.length) / previousPeriod.length) * 100).toFixed(1) : 100
      },
      stamps: {
        current: filteredCustomers.reduce((sum, c) => sum + (c.stamps || 0), 0),
        previous: previousPeriod.reduce((sum, c) => sum + (c.stamps || 0), 0)
      }
    };

    return {
      totalCustomers,
      newCustomers,
      totalStamps,
      totalRewards,
      activeCustomers,
      dailyTrends,
      hourlyActivity,
      weeklyDistribution,
      cohortAnalysis,
      performanceMetrics,
      comparison
    };
  }, [customers, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportAnalytics = () => {
    const analyticsReport = {
      generatedAt: new Date().toISOString(),
      timeRange: `${timeRange} días`,
      summary: {
        totalCustomers: analyticsData.totalCustomers,
        newCustomers: analyticsData.newCustomers,
        totalStamps: analyticsData.totalStamps,
        totalRewards: analyticsData.totalRewards,
        activeCustomers: analyticsData.activeCustomers
      },
      trends: analyticsData.dailyTrends,
      performance: analyticsData.performanceMetrics,
      behavioral: {
        hourlyActivity: analyticsData.hourlyActivity,
        weeklyDistribution: analyticsData.weeklyDistribution,
        cohortAnalysis: analyticsData.cohortAnalysis
      },
      comparison: analyticsData.comparison
    };

    const blob = new Blob([JSON.stringify(analyticsReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-acrilcard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Análisis en tiempo real y tendencias de comportamiento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="border-gray-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <Button onClick={exportAnalytics} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principales con comparación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <div className="flex items-center space-x-1">
                {getChangeIcon(analyticsData.comparison.customers.change)}
                <span className={`text-sm font-medium ${getChangeColor(analyticsData.comparison.customers.change)}`}>
                  {Math.abs(analyticsData.comparison.customers.change)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.newCustomers}</p>
            <p className="text-sm text-gray-600">Nuevos clientes</p>
            <p className="text-xs text-gray-500 mt-1">
              vs {analyticsData.comparison.customers.previous} período anterior
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {analyticsData.performanceMetrics.engagementRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.activeCustomers}</p>
            <p className="text-sm text-gray-600">Clientes activos</p>
            <p className="text-xs text-gray-500 mt-1">
              Tasa de engagement
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                {analyticsData.performanceMetrics.avgStampsPerCustomer}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStamps}</p>
            <p className="text-sm text-gray-600">Total sellos</p>
            <p className="text-xs text-gray-500 mt-1">
              Promedio por cliente
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">
                {analyticsData.performanceMetrics.conversionRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalRewards}</p>
            <p className="text-sm text-gray-600">Recompensas</p>
            <p className="text-xs text-gray-500 mt-1">
              Tasa de conversión
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                {analyticsData.performanceMetrics.avgStampsPerMonth}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analyticsData.totalCustomers / analyticsData.totalStamps}
            </p>
            <p className="text-sm text-gray-600">Sellos/Mes</p>
            <p className="text-xs text-gray-500 mt-1">
              Promedio de sellos por mes
            </p>
          </div>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tendencia diaria */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Tendencia de Nuevos Clientes
              </h3>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="overview">Vista general</option>
                <option value="cumulative">Acumulativo</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end space-x-1">
              {analyticsData.dailyTrends.slice(-14).map((day, index) => {
                const maxValue = Math.max(...analyticsData.dailyTrends.map(d => 
                  selectedChart === 'cumulative' ? d.cumulative : d.customers
                ));
                const value = selectedChart === 'cumulative' ? day.cumulative : day.customers;
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: ${value} clientes`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribución semanal */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Distribución por Día de la Semana
            </h3>
            
            <div className="space-y-3">
              {analyticsData.weeklyDistribution.map((day) => {
                const maxCount = Math.max(...analyticsData.weeklyDistribution.map(d => d.count));
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                
                return (
                  <div key={day.day} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-8">{day.day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Análisis de comportamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Actividad por horas */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Actividad por Horas
            </h3>
            
            <div className="grid grid-cols-6 gap-1">
              {analyticsData.hourlyActivity.map((hour) => {
                const maxCount = Math.max(...analyticsData.hourlyActivity.map(h => h.count));
                const intensity = maxCount > 0 ? hour.count / maxCount : 0;
                
                return (
                  <div
                    key={hour.hour}
                    className={`aspect-square rounded text-xs flex items-center justify-center font-medium ${
                      intensity > 0.7 ? 'bg-purple-600 text-white' :
                      intensity > 0.4 ? 'bg-purple-400 text-white' :
                      intensity > 0.1 ? 'bg-purple-200 text-purple-800' :
                      'bg-gray-100 text-gray-600'
                    }`}
                    title={`${hour.hour}:00 - ${hour.count} clientes`}
                  >
                    {hour.hour}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
              <span>00:00</span>
              <span>Horas del día</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Análisis de cohortes */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Retención por Cohortes
            </h3>
            
            <div className="space-y-3">
              {[
                { label: 'Semana 1', value: analyticsData.cohortAnalysis.week1, color: 'bg-indigo-500' },
                { label: 'Semana 2', value: analyticsData.cohortAnalysis.week2, color: 'bg-indigo-400' },
                { label: 'Semana 3', value: analyticsData.cohortAnalysis.week3, color: 'bg-indigo-300' },
                { label: 'Semana 4', value: analyticsData.cohortAnalysis.week4, color: 'bg-indigo-200' }
              ].map((cohort) => {
                const percentage = analyticsData.totalCustomers > 0 ? 
                  (cohort.value / analyticsData.totalCustomers) * 100 : 0;
                
                return (
                  <div key={cohort.label} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-20">{cohort.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`${cohort.color} h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {cohort.value}
                    </span>
                    <span className="text-xs text-gray-600 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPIs de rendimiento */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-600" />
              KPIs de Rendimiento
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Días promedio a 1er premio</span>
                <span className="font-medium text-gray-900">{analyticsData.performanceMetrics.avgDaysToFirstReward} {analyticsData.performanceMetrics.avgDaysToFirstReward !== 'N/A' ? 'días' : ''}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Frecuencia de visitas</span>
                <span className="font-medium text-gray-900">{analyticsData.performanceMetrics.avgStampsPerMonth} sellos/mes</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de engagement</span>
                <span className="font-medium text-gray-900">{analyticsData.performanceMetrics.engagementRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de conversión</span>
                <span className="font-medium text-gray-900">{analyticsData.performanceMetrics.conversionRate}%</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Score general</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min(parseFloat(analyticsData.performanceMetrics.engagementRate), 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      {(parseFloat(analyticsData.performanceMetrics.engagementRate) * 0.8).toFixed(0)}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights y recomendaciones */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Insights y Recomendaciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 Crecimiento</h4>
              <p className="text-sm text-blue-800">
                Tu base de clientes creció un {Math.abs(analyticsData.comparison.customers.change)}% 
                comparado con el período anterior. 
                {parseFloat(analyticsData.comparison.customers.change) > 0 ? 
                  ' ¡Excelente tendencia!' : 
                  ' Considera estrategias de adquisición.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎯 Engagement</h4>
              <p className="text-sm text-green-800">
                {parseFloat(analyticsData.performanceMetrics.engagementRate) > 60 ?
                  'Excelente nivel de engagement. Tus clientes están muy activos.' :
                  parseFloat(analyticsData.performanceMetrics.engagementRate) > 30 ?
                  'Buen nivel de engagement. Hay oportunidades de mejora.' :
                  'El engagement es bajo. Considera campañas de reactivación.'
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">💡 Oportunidad</h4>
              <p className="text-sm text-purple-800">
                {analyticsData.totalCustomers - analyticsData.activeCustomers} clientes están inactivos. 
                Una campaña de reactivación podría generar hasta {
                  ((analyticsData.totalCustomers - analyticsData.activeCustomers) * 0.3).toFixed(0)
                } nuevos clientes activos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

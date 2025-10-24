import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Award, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
  Star,
  ArrowLeft
} from 'lucide-react';
import { Button } from './common';
import { useCustomers } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const { customers } = useCustomers();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('all');
  const [reportType, setReportType] = useState('overview');

  // Calcular estadísticas generales
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const totalCustomers = customers.length;
    const totalStamps = customers.reduce((sum, customer) => sum + (customer.stamps || 0), 0);
    const totalRewards = customers.reduce((sum, customer) => sum + (customer.rewards || 0), 0);
    
    // Clientes activos (con al menos 1 sello)
    const activeCustomers = customers.filter(customer => (customer.stamps || 0) > 0).length;
    
    // Clientes nuevos este mes
    const newThisMonth = customers.filter(customer => {
      const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
      return createdDate >= thisMonth;
    }).length;

    // Clientes que han canjeado recompensas
    const customersWithRewards = customers.filter(customer => (customer.rewards || 0) > 0).length;

    // Promedio de sellos por cliente activo
    const avgStampsPerActiveCustomer = activeCustomers > 0 ? (totalStamps / activeCustomers).toFixed(1) : 0;

    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      totalStamps,
      totalRewards,
      customersWithRewards,
      avgStampsPerActiveCustomer,
      inactiveCustomers: totalCustomers - activeCustomers
    };
  }, [customers]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Distribución de sellos
    const stampDistribution = {
      '0 sellos': customers.filter(c => (c.stamps || 0) === 0).length,
      '1-3 sellos': customers.filter(c => (c.stamps || 0) >= 1 && (c.stamps || 0) <= 3).length,
      '4-6 sellos': customers.filter(c => (c.stamps || 0) >= 4 && (c.stamps || 0) <= 6).length,
      '7-9 sellos': customers.filter(c => (c.stamps || 0) >= 7 && (c.stamps || 0) <= 9).length,
      '10+ sellos': customers.filter(c => (c.stamps || 0) >= 10).length
    };

    // Actividad por mes (últimos 6 meses)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      
      const monthCustomers = customers.filter(customer => {
        const createdDate = new Date(customer.createdAt || customer.dateAdded || Date.now());
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      }).length;

      monthlyActivity.push({ month: monthName, customers: monthCustomers });
    }

    return { stampDistribution, monthlyActivity };
  }, [customers]);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      statistics: stats,
      customers: customers.map(customer => ({
        name: customer.name,
        phone: customer.phone,
        stamps: customer.stamps || 0,
        rewards: customer.rewards || 0,
        createdAt: customer.createdAt || customer.dateAdded,
        lastActivity: customer.lastStampDate
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-acrilcard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                <p className="text-gray-600">Análisis detallado de tu programa de fidelización</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todo el tiempo</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>
              
              <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.newThisMonth} nuevos este mes
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% del total
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sellos</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalStamps}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.avgStampsPerActiveCustomer} promedio por cliente activo
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recompensas</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalRewards}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.customersWithRewards} clientes han canjeado
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribución de sellos */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-blue-600" />
              Distribución de Sellos
            </h3>
            <div className="space-y-3">
              {Object.entries(chartData.stampDistribution).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-200 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max((count / stats.totalCustomers) * 100, 2)}px`,
                        minWidth: '20px'
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad mensual */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Nuevos Clientes (6 meses)
            </h3>
            <div className="space-y-3">
              {chartData.monthlyActivity.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-green-200 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max((data.customers / Math.max(...chartData.monthlyActivity.map(d => d.customers))) * 100, 2)}px`,
                        minWidth: '20px'
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{data.customers}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de resumen */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Resumen Detallado</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Engagement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de actividad:</span>
                    <span className="font-medium">
                      {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de canje:</span>
                    <span className="font-medium">
                      {((stats.customersWithRewards / stats.totalCustomers) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clientes inactivos:</span>
                    <span className="font-medium">{stats.inactiveCustomers}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Rendimiento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sellos por cliente:</span>
                    <span className="font-medium">{stats.avgStampsPerActiveCustomer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recompensas por cliente:</span>
                    <span className="font-medium">
                      {(stats.totalRewards / stats.totalCustomers).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crecimiento mensual:</span>
                    <span className="font-medium text-green-600">+{stats.newThisMonth}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Proyecciones</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crecimiento estimado:</span>
                    <span className="font-medium">
                      {(stats.newThisMonth * 12)} clientes/año
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potencial de sellos:</span>
                    <span className="font-medium">
                      {stats.inactiveCustomers * 5} sellos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado del programa:</span>
                    <span className={`font-medium ${
                      stats.activeCustomers / stats.totalCustomers > 0.6 ? 'text-green-600' : 
                      stats.activeCustomers / stats.totalCustomers > 0.3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stats.activeCustomers / stats.totalCustomers > 0.6 ? 'Excelente' : 
                       stats.activeCustomers / stats.totalCustomers > 0.3 ? 'Bueno' : 'Mejorable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

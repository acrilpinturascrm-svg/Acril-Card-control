import React, { useMemo, useState, useCallback } from 'react';
import { Search, User, Award, Gift, ShoppingBag, Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react';
import { InputAdornment, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { InputField } from './common';
import { digitsOnly, normalizeStr, getProgressPercentage } from '../utils/logic';

const CustomerItem = React.memo(({ customer, onSelect, stampsPerReward }) => {
  const progressPercentage = getProgressPercentage(customer.stamps, stampsPerReward);

  return (
    <div
      className={`customer-item p-4 rounded-lg border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
        customer.selected
          ? 'border-red-800 bg-red-50 border-l-4 border-l-blue-500'
          : 'border-gray-200 hover:border-yellow-600 hover:bg-gray-50'
      }`}
      onClick={() => onSelect(customer)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(customer);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Seleccionar cliente ${customer.name}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-red-800" />
          <div>
            <h3 className="font-semibold text-gray-800">{customer.name}</h3>
            <p className="text-sm text-gray-600">{customer.phone}</p>
            <p className="text-xs text-gray-500">
              {customer.idType} - {customer.idNumber}
            </p>
            <p className="text-xs text-yellow-600 font-semibold">Código: {customer.code}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-red-800">
              {customer.stamps % stampsPerReward}
            </div>
            <div className="text-sm text-gray-500">/ {stampsPerReward}</div>
          </div>
          {Math.floor(customer.stamps / stampsPerReward) > 0 && (
            <div className="text-xs text-green-600 font-semibold">
              {Math.floor(customer.stamps / stampsPerReward)} premio(s) disponible(s)
            </div>
          )}
        </div>
      </div>
      {/* Barra de progreso */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-red-800 to-yellow-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
});

CustomerItem.displayName = 'CustomerItem';

const CustomerList = ({
  stampsPerReward = 10,
  onCustomerSelect,
  customers = [] // Recibir customers como prop
}) => {
  // Estados locales para filtros (en lugar de usar el contexto)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStamps, setFilterByStamps] = useState('all');
  const [filterByDate, setFilterByDate] = useState('all');

  const [showDateFilters, setShowDateFilters] = useState(false);

  // Función para filtrar clientes por fecha
  const filterCustomersByDate = useCallback((customersList, dateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return customersList.filter(customer => {
      if (!customer.lastUpdated && !customer.updatedAt) return dateFilter === 'all';
      
      const customerDate = new Date(customer.lastUpdated || customer.updatedAt);
      const customerDay = new Date(customerDate.getFullYear(), customerDate.getMonth(), customerDate.getDate());
      const diffTime = today - customerDay;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch(dateFilter) {
        case 'today':
          return diffDays === 0;
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'older':
          return diffDays > 30;
        case 'all':
        default:
          return true;
      }
    });
  }, []);

  // Filtrar clientes usando los props recibidos
  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        (customer.name || '').toLowerCase().includes(term) ||
        (customer.phone || '').includes(term) ||
        (customer.idNumber || '').toString().includes(term) ||
        (customer.code || '').toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro por fecha
    if (filterByDate !== 'all') {
      result = filterCustomersByDate(result, filterByDate);
    }
    
    // Aplicar filtro por sellos
    if (filterByStamps !== 'all') {
      result = result.filter(customer => {
        const stamps = customer.stamps || 0;
        const currentStamps = stamps % stampsPerReward;
        
        switch(filterByStamps) {
          case 'empty':
            return stamps === 0;
          case 'half':
            return currentStamps > 0 && currentStamps < stampsPerReward / 2;
          case 'almost':
            return currentStamps >= stampsPerReward / 2 && currentStamps < stampsPerReward;
          case 'full':
            return Math.floor(stamps / stampsPerReward) > 0;
          default:
            return true;
        }
      });
    }
    
    return result;
  }, [customers, searchTerm, filterByDate, filterByStamps, filterCustomersByDate, stampsPerReward]);

  const handleDateFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterByDate(newFilter);
    }
  };

  const toggleDateFilters = () => {
    setShowDateFilters(!showDateFilters);
    if (showDateFilters) {
      setFilterByDate('all');
    }
  };

  const handleCustomerSelect = (customer) => {
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header fijo con título */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Lista de Clientes ({filteredCustomers.length})
        </h3>
      </div>

      {/* Controles fijos (búsqueda y filtros) */}
      <div className="p-4 space-y-4 border-b border-gray-200 bg-white">
        {/* Barra de búsqueda */}
        <div className="relative">
          <InputField
            fullWidth
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="bg-white"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Filtro por sellos */}
          <ToggleButtonGroup
            value={filterByStamps}
            exclusive
            onChange={(e, newValue) => newValue !== null && setFilterByStamps(newValue)}
            aria-label="filtro de sellos"
            size="small"
          >
            <ToggleButton value="all" aria-label="todos">
              <span className="text-xs">Todos</span>
            </ToggleButton>
            <ToggleButton value="empty" aria-label="sin sellos">
              <span className="text-xs">Vacías</span>
            </ToggleButton>
            <ToggleButton value="half" aria-label="a la mitad">
              <span className="text-xs">A mitad</span>
            </ToggleButton>
            <ToggleButton value="almost" aria-label="casi llenas">
              <span className="text-xs">Casi llenas</span>
            </ToggleButton>
            <ToggleButton value="full" aria-label="llenas">
              <span className="text-xs">Llenas</span>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Botón de filtro por fecha */}
          <Tooltip title="Filtrar por fecha">
            <ToggleButton
              value="date"
              selected={showDateFilters || filterByDate !== 'all'}
              onChange={toggleDateFilters}
              aria-label="filtrar por fecha"
              size="small"
              className="ml-2"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              <span className="text-xs">Fecha</span>
            </ToggleButton>
          </Tooltip>

          {/* Filtros de fecha desplegables */}
          {showDateFilters && (
            <div className="flex gap-2 ml-2 bg-gray-50 p-2 rounded-md">
              <ToggleButtonGroup
                value={filterByDate}
                exclusive
                onChange={handleDateFilterChange}
                aria-label="filtro de fecha"
                size="small"
              >
                <Tooltip title="Hoy">
                  <ToggleButton value="today" aria-label="hoy">
                    <Clock className="w-4 h-4" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Últimos 7 días">
                  <ToggleButton value="week" aria-label="esta semana">
                    <Calendar className="w-4 h-4" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Últimos 30 días">
                  <ToggleButton value="month" aria-label="este mes">
                    <CalendarDays className="w-4 h-4" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Más antiguos">
                  <ToggleButton value="older" aria-label="antiguos">
                    <CalendarRange className="w-4 h-4" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Limpiar filtro">
                  <ToggleButton value="all" aria-label="todos">
                    <span className="text-xs">Todos</span>
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </div>
          )}
        </div>
      </div>

      {/* Lista de clientes con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerItem
                key={customer.id}
                customer={customer}
                onSelect={handleCustomerSelect}
                stampsPerReward={stampsPerReward}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterByStamps !== 'all' || filterByDate !== 'all' 
                ? 'No se encontraron clientes que coincidan con los filtros.'
                : 'No hay clientes registrados.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;

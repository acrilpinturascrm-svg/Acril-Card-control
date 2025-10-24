import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerProvider, useCustomers } from '../contexts/CustomerContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Componente de prueba para usar el contexto
const TestCustomerComponent = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    selectedCustomer,
    loading
  } = useCustomers();

  const handleAddCustomer = async () => {
    try {
      await addCustomer({
        name: 'Test Customer',
        phone: '04141234567',
        idType: 'V',
        idNumber: '12345678'
      });
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleUpdateCustomer = () => {
    if (customers.length > 0) {
      updateCustomer(customers[0].id, { name: 'Updated Name' });
    }
  };

  const handleDeleteCustomer = () => {
    if (customers.length > 0) {
      deleteCustomer(customers[0].id);
    }
  };

  const handleSelectCustomer = () => {
    if (customers.length > 0) {
      selectCustomer(customers[0]);
    }
  };

  return (
    <div>
      <div data-testid="customer-count">{customers.length}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      {selectedCustomer && (
        <div data-testid="selected-customer">{selectedCustomer.name}</div>
      )}

      <button onClick={handleAddCustomer} data-testid="add-customer">
        Add Customer
      </button>
      <button onClick={handleUpdateCustomer} data-testid="update-customer">
        Update Customer
      </button>
      <button onClick={handleDeleteCustomer} data-testid="delete-customer">
        Delete Customer
      </button>
      <button onClick={handleSelectCustomer} data-testid="select-customer">
        Select Customer
      </button>
    </div>
  );
};

// Componente wrapper para los tests
const TestWrapper = ({ children }) => (
  <NotificationProvider>
    <CustomerProvider>
      {children}
    </CustomerProvider>
  </NotificationProvider>
);

describe('CustomerContext', () => {
  test('debe inicializar con array vacío de clientes', () => {
    render(
      <TestWrapper>
        <TestCustomerComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('customer-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
  });

  test('debe agregar un cliente correctamente', async () => {
    render(
      <TestWrapper>
        <TestCustomerComponent />
      </TestWrapper>
    );

    const addButton = screen.getByTestId('add-customer');
    fireEvent.click(addButton);

    // Esperar a que se complete la operación
    await waitFor(() => {
      expect(screen.getByTestId('customer-count')).toHaveTextContent('1');
    });
  });

  test('debe seleccionar un cliente', async () => {
    render(
      <TestWrapper>
        <TestCustomerComponent />
      </TestWrapper>
    );

    // Agregar un cliente primero
    const addButton = screen.getByTestId('add-customer');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('customer-count')).toHaveTextContent('1');
    });

    // Seleccionar el cliente
    const selectButton = screen.getByTestId('select-customer');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByTestId('selected-customer')).toHaveTextContent('Test Customer');
    });
  });

  test('debe actualizar un cliente', async () => {
    render(
      <TestWrapper>
        <TestCustomerComponent />
      </TestWrapper>
    );

    // Agregar un cliente primero
    const addButton = screen.getByTestId('add-customer');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('customer-count')).toHaveTextContent('1');
    });

    // Actualizar el cliente
    const updateButton = screen.getByTestId('update-customer');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('selected-customer')).toHaveTextContent('Updated Name');
    });
  });

  test('debe eliminar un cliente', async () => {
    render(
      <TestWrapper>
        <TestCustomerComponent />
      </TestWrapper>
    );

    // Agregar un cliente primero
    const addButton = screen.getByTestId('add-customer');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('customer-count')).toHaveTextContent('1');
    });

    // Eliminar el cliente
    const deleteButton = screen.getByTestId('delete-customer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('customer-count')).toHaveTextContent('0');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { CustomerProvider } from '../../contexts/CustomerContext';
import CustomerForm from '../CustomerForm';

// Componente wrapper para los tests
const TestWrapper = ({ children }) => (
  <NotificationProvider>
    <CustomerProvider>
      {children}
    </CustomerProvider>
  </NotificationProvider>
);

describe('CustomerForm', () => {
  test('debe renderizar el formulario correctamente', () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    expect(screen.getByText('Agregar Nuevo Cliente')).toBeInTheDocument();
    expect(screen.getByText('Nombre Completo *')).toBeInTheDocument();
    expect(screen.getByText('Teléfono *')).toBeInTheDocument();
    expect(screen.getByText('Tipo de ID *')).toBeInTheDocument();
    expect(screen.getByText('Número de ID *')).toBeInTheDocument();
    expect(screen.getByText('Agregar Cliente')).toBeInTheDocument();
  });

  test('debe mostrar errores de validación para campos vacíos', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Agregar Cliente');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument();
      expect(screen.getByText('El número de identificación es requerido')).toBeInTheDocument();
    });
  });

  test('debe mostrar error para nombre muy corto', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Nombre Completo *');
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitButton = screen.getByText('Agregar Cliente');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });
  });

  test('debe mostrar error para teléfono inválido', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const phoneInput = screen.getByLabelText('Teléfono *');
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const submitButton = screen.getByText('Agregar Cliente');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El teléfono debe tener entre 8 y 15 dígitos')).toBeInTheDocument();
    });
  });

  test('debe mostrar error para número de ID inválido', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const idInput = screen.getByLabelText('Número de ID *');
    fireEvent.change(idInput, { target: { value: '123' } });

    const submitButton = screen.getByText('Agregar Cliente');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El número debe tener entre 6 y 12 dígitos')).toBeInTheDocument();
    });
  });

  test('debe limpiar errores cuando el usuario escribe', async () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    // Intentar enviar formulario vacío
    const submitButton = screen.getByText('Agregar Cliente');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });

    // Escribir en el campo de nombre
    const nameInput = screen.getByLabelText('Nombre Completo *');
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });

    // El error debería desaparecer
    expect(screen.queryByText('El nombre es requerido')).not.toBeInTheDocument();
  });

  test('debe mostrar preview del código cuando se completan los campos', () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    // Llenar los campos requeridos
    const nameInput = screen.getByLabelText('Nombre Completo *');
    const idTypeSelect = screen.getByLabelText('Tipo de ID *');
    const idNumberInput = screen.getByLabelText('Número de ID *');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(idTypeSelect, { target: { value: 'V' } });
    fireEvent.change(idNumberInput, { target: { value: '12345678' } });

    // Debería aparecer el preview del código
    expect(screen.getByText(/V-\d+/)).toBeInTheDocument();
  });

  test('debe mostrar preview de la cédula', () => {
    render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    );

    const idTypeSelect = screen.getByLabelText('Tipo de ID *');
    const idNumberInput = screen.getByLabelText('Número de ID *');

    fireEvent.change(idTypeSelect, { target: { value: 'V' } });
    fireEvent.change(idNumberInput, { target: { value: '12345678' } });

    expect(screen.getByText('V-12345678')).toBeInTheDocument();
  });
});

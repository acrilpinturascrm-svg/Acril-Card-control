import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notification from '../Notification';

describe('Notification', () => {
  test('renders message and closes on click', async () => {
    const handleClose = jest.fn();
    render(
      <Notification
        message="Hola mundo"
        type="success"
        onClose={handleClose}
        autoClose={false}
        position="top-right"
      />
    );

    expect(screen.getByText('Hola mundo')).toBeInTheDocument();

    // Click close button
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  test('auto closes after duration', async () => {
    const handleClose = jest.fn();
    render(
      <Notification
        message="Auto close"
        type="info"
        onClose={handleClose}
        autoClose={true}
        autoCloseDuration={200}
      />
    );

    await waitFor(() => expect(handleClose).toHaveBeenCalled(), { timeout: 1000 });
  });
});

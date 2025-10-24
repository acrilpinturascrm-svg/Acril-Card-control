import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotification } from '../NotificationContext';

function Consumer() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  return (
    <div>
      <button onClick={() => showSuccess('ok')}>success</button>
      <button onClick={() => showError('bad')}>error</button>
      <button onClick={() => showWarning('warn')}>warning</button>
      <button onClick={() => showInfo('info')}>info</button>
    </div>
  );
}

describe('NotificationContext', () => {
  test('shows notifications from context actions', async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    await user.click(screen.getByText('success'));
    expect(screen.getByText('ok')).toBeInTheDocument();

    await user.click(screen.getByText('error'));
    expect(screen.getByText('bad')).toBeInTheDocument();

    await user.click(screen.getByText('warning'));
    expect(screen.getByText('warn')).toBeInTheDocument();

    await user.click(screen.getByText('info'));
    expect(screen.getByText('info')).toBeInTheDocument();
  });
});

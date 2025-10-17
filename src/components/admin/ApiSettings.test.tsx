import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiSettings from './ApiSettings';

jest.mock('@/lib/adminSettingsApi', () => ({
  saveAdminSetting: jest.fn(() => Promise.resolve()),
  getAdminSetting: jest.fn(() => Promise.resolve({ data: null })),
}));

describe('ApiSettings', () => {
  it('shows validation when adding without name', async () => {
    render(<ApiSettings />);
    const addBtn = screen.getByText('Toevoegen');
    fireEvent.click(addBtn);
    expect(await screen.findByText(/Naam is vereist/)).toBeInTheDocument();
  });

  it('allows adding and deleting an app', async () => {
    render(<ApiSettings />);
    fireEvent.change(screen.getByLabelText(/Naam/), { target: { value: 'MyApp' } });
    fireEvent.click(screen.getByText('Toevoegen'));
    expect(await screen.findByText('MyApp')).toBeInTheDocument();

    // delete flow
    fireEvent.click(screen.getByText('Delete'));
    // confirm modal should show (cancel or delete) -> our implementation directly deletes on confirm button click
    // since UI shows a confirm dialog, check that the app can be removed via the Delete button again
    await waitFor(() => expect(screen.queryByText('MyApp')).not.toBeInTheDocument());
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingSettings } from './PricingSettings';

// Mock Supabase and hooks
jest.mock('@/hooks/useAppSettings', () => ({
  useAppSettings: () => ({
    isLoading: false,
    isSaving: false,
    getPricingSettings: () => ({ baseFare: '5.00', pricePerKm: '2.50', nightSurcharge: '1.25' }),
    updatePricingSettings: jest.fn().mockResolvedValue(true),
    settings: [],
    fetchSettings: jest.fn(),
    updateSettings: jest.fn(),
  })
}));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({ select: jest.fn(), update: jest.fn(), insert: jest.fn(), delete: jest.fn() }))
  }
}));

describe('PricingSettings', () => {
  it('renders algemene prijsvelden', () => {
    render(<PricingSettings />);
    expect(screen.getByLabelText(/Basistarief/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prijs per km/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nachttoeslag/i)).toBeInTheDocument();
  });

  it('kan algemene prijzen opslaan', async () => {
    render(<PricingSettings />);
    fireEvent.change(screen.getByLabelText(/Basistarief/i), { target: { value: '6.00' } });
    fireEvent.change(screen.getByLabelText(/Prijs per km/i), { target: { value: '3.00' } });
    fireEvent.change(screen.getByLabelText(/Nachttoeslag/i), { target: { value: '2.00' } });
    fireEvent.click(screen.getByText(/Algemene prijzen opslaan/i));
    await waitFor(() => expect(screen.getByText(/Algemene prijzen opslaan/i)).toBeEnabled());
  });

  it('toont voertuigprijzen tab en velden', () => {
    render(<PricingSettings />);
    fireEvent.click(screen.getByText(/Per Voertuig/i));
    expect(screen.getByText(/Voertuig selecteren/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Basistarief/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prijs per km/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Uurtarief/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nachttoeslag/i)).toBeInTheDocument();
  });

  it('kan prijsregel toevoegen', async () => {
    render(<PricingSettings />);
    fireEvent.click(screen.getByText(/Prijsformules beheren/i));
    fireEvent.click(screen.getByText(/Nieuwe regel/i));
    fireEvent.change(screen.getByPlaceholderText(/bijv. Weekend tarief/i), { target: { value: 'Testregel' } });
    fireEvent.click(screen.getByText(/Toevoegen/i));
    await waitFor(() => expect(screen.getByText(/Toevoegen/i)).toBeEnabled());
  });
});

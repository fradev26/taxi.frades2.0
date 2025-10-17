import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeColors from './ThemeColors';

describe('ThemeColors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders and saves to localStorage', () => {
    render(<ThemeColors />);
    const saveBtn = screen.getByText(/Opslaan/i);
    fireEvent.click(saveBtn);
    const raw = localStorage.getItem('admin:theme:colors');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.config).toBeDefined();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

// The badge reads the dataset context, which is irrelevant to navigation.
vi.mock('./DatasetVersionBadge', () => ({ DatasetVersionBadge: () => null }));

describe('TopBar', () => {
  it('navigates to the landing page from the Home menu item', () => {
    render(
      <MemoryRouter initialEntries={['/map']}>
        <Routes>
          <Route path="/" element={<p>Landing page</p>} />
          <Route path="/map" element={<TopBar />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(screen.getByText('Landing page')).toBeInTheDocument();
  });
});

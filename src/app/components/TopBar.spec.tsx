import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

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

  it('shows the Local/Global switch with the current mode pressed', () => {
    const onModeChange = vi.fn();
    render(
      <MemoryRouter>
        <TopBar mode="local" onModeChange={onModeChange} />
      </MemoryRouter>,
    );

    const group = within(screen.getByRole('group', { name: 'Map mode' }));
    expect(
      group.getByRole('button', { name: 'Local wildlife data' }),
    ).toHaveAttribute('aria-pressed', 'true');
    const global = group.getByRole('button', { name: 'Global assessment' });
    expect(global).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(global);
    expect(onModeChange).toHaveBeenCalledWith('global');

    // Clicking the mode that's already on does nothing.
    fireEvent.click(group.getByRole('button', { name: 'Local wildlife data' }));
    expect(onModeChange).toHaveBeenCalledTimes(1);
  });

  it('hides the switch when no mode is given', () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('group', { name: 'Map mode' })).toBeNull();
  });
});

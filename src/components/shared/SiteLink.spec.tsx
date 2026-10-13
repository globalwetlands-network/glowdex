import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SiteDestinationId } from '@/constants/comingSoon';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

// The config switch: tests swap which ids are still "coming soon".
const comingSoon = vi.hoisted(() => ({ ids: new Set<string>() }));
vi.mock('@/constants/comingSoon', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/constants/comingSoon')>();
  return {
    ...actual,
    isComingSoon: (id: SiteDestinationId) => comingSoon.ids.has(id),
  };
});

import { SiteLink } from './SiteLink';

function renderSiteLink(id: SiteDestinationId) {
  render(
    <MemoryRouter>
      <SiteLink id={id} location="footer" className="hover:underline">
        Label
      </SiteLink>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());

describe('SiteLink', () => {
  it('renders the coming-soon control while the id is listed', () => {
    comingSoon.ids = new Set(['methods']);
    renderSiteLink('methods');

    expect(
      screen.getByRole('button', { name: 'Label' }),
    ).toHaveAccessibleDescription('Coming soon');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a real link once the id is removed from the list', () => {
    comingSoon.ids = new Set();
    renderSiteLink('methods');

    const link = screen.getByRole('link', { name: 'Label' });
    expect(link).toHaveAttribute('href', '/methods');
    expect(link).toHaveClass('hover:underline');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

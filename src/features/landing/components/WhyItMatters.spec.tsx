import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WhyItMatters } from './WhyItMatters';

function renderSection() {
  return render(
    <MemoryRouter>
      <WhyItMatters />
    </MemoryRouter>,
  );
}

describe('WhyItMatters', () => {
  it('renders the heading and both paragraphs verbatim', () => {
    renderSection();

    const section = within(
      screen.getByRole('region', { name: 'Why it matters' }),
    );
    expect(
      section.getByText(
        'Mangroves protect coastlines, store carbon, shelter young fish and support the livelihoods of coastal communities.',
      ),
    ).toBeVisible();
    expect(
      section.getByText(
        "But a mangrove in Kenya and one in Australia face very different conditions. Comparing each to similar places, not to a global average, shows what's unusual about it and helps focus conservation where it's actually needed.",
      ),
    ).toBeVisible();
  });

  it('renders the Local then Global pair below the paragraphs, named like the map modes', () => {
    renderSection();

    const labels = screen.getAllByRole('heading', { level: 3 });
    expect(labels.map((label) => label.textContent)).toEqual([
      'Local wildlife data',
      'Global assessment',
    ]);
    expect(
      screen.getByText(
        'After a restoration effort or a disturbance, local wildlife monitoring tracks whether a site is recovering toward a healthy reference condition, comparing reference, degraded and rehabilitated areas over time.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'The global assessment shows how a place sits against others like it, giving restoration work a benchmark for what recovery should look like.',
      ),
    ).toBeVisible();
    expect(
      screen
        .getByText(/in kenya and one in australia/i)
        .compareDocumentPosition(labels[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('links each block into its own mode of the map', () => {
    renderSection();

    for (const [name, href] of [
      ['Explore local wildlife data', '/map?mode=local'],
      ['Explore the global assessment', '/map?mode=global'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });
});

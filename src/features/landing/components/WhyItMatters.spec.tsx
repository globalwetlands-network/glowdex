import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhyItMatters } from './WhyItMatters';

describe('WhyItMatters', () => {
  it('renders the heading and both paragraphs verbatim', () => {
    render(<WhyItMatters />);

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
        "But a mangrove in Kenya and one in Australia face very different conditions. Comparing each place with similar ones shows what's typical and what stands out, which helps focus conservation where it's needed.",
      ),
    ).toBeVisible();
  });

  it('renders the Local then Global pair below the paragraphs, verbatim', () => {
    render(<WhyItMatters />);

    const labels = screen.getAllByRole('heading', { level: 3 });
    expect(labels.map((label) => label.textContent)).toEqual([
      'Local',
      'Global',
    ]);
    expect(
      screen.getByText(
        'After a restoration effort or a disturbance, local monitoring tracks whether a site is recovering toward a healthy reference condition, comparing reference, degraded and rehabilitated areas over time.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'The global comparison shows how a place sits against others like it, giving restoration work a benchmark for what recovery should look like.',
      ),
    ).toBeVisible();
    expect(
      screen
        .getByText(/in kenya and one in australia/i)
        .compareDocumentPosition(labels[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

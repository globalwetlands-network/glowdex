import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FactSheet } from './FactSheet';

describe('FactSheet', () => {
  it('renders the four figures with their labels', () => {
    render(<FactSheet />);

    const items = within(
      screen.getByRole('region', { name: /at a glance/i }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(4);

    for (const [value, label] of [
      ['1,600+', /mangrove areas analysed worldwide/i],
      ['~20', /^indicators$/i],
      ['14', /monitoring sites in 8 countries and territories/i],
      ['19', /research partners in 17 countries/i],
    ] as const) {
      expect(screen.getByText(value)).toBeVisible();
      expect(screen.getByText(label)).toBeVisible();
    }
  });

  it('shows no provisional tags while every figure is confirmed', () => {
    render(<FactSheet />);

    expect(screen.queryByText('Provisional')).toBeNull();
  });

  it('tags only the figures marked provisional', () => {
    render(
      <FactSheet
        figures={[
          { value: '1', label: 'unconfirmed', provisional: true },
          { value: '2', label: 'confirmed', provisional: false },
        ]}
      />,
    );

    const items = screen.getAllByRole('listitem');
    const tagged = items.map(
      (item) => within(item).queryByText('Provisional') !== null,
    );
    expect(tagged).toEqual([true, false]);
  });
});

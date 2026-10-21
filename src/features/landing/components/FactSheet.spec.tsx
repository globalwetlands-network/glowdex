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
      ['1,600+', 'Mangrove areas analysed worldwide'],
      ['~20', 'Indicators'],
      ['14', 'Monitoring locations in 8 countries and territories'],
      ['19', 'Research partners in 17 countries'],
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

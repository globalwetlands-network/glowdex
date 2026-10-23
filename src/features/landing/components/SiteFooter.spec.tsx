import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDatasetVersion } from '@/data/hooks/useDatasetVersion';
import { FOOTER_CREDIT } from '../config/footer';
import { SiteFooter } from './SiteFooter';

vi.mock('@/data/hooks/useDatasetVersion', () => ({
  useDatasetVersion: vi.fn(),
}));

describe('SiteFooter', () => {
  beforeEach(() => {
    vi.mocked(useDatasetVersion).mockReturnValue('2026.09.0');
  });

  it('renders the footer nav in order and the builder credit verbatim', () => {
    render(<SiteFooter />);

    const nav = within(screen.getByRole('navigation', { name: 'Footer' }));
    // Links and coming-soon buttons, in DOM order.
    const items = screen
      .getByRole('navigation', { name: 'Footer' })
      .querySelectorAll('a, button');
    expect([...items].map((item) => item.textContent)).toEqual([
      'About',
      'Methods',
      'FAQ',
      'Licence',
      'How to cite',
      'Contact',
      'Privacy',
    ]);
    // Every item but FAQ is "Coming soon" until its page exists (GLO-210).
    expect(nav.getAllByRole('link')).toHaveLength(1);
    for (const button of nav.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAccessibleDescription('Coming soon');
    }
    expect(nav.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '#faq',
    );
    expect(
      screen.getByText(
        'MBCAM is built by the Global Wetlands Project at Griffith University and the University of the Western Cape, working with global partners listed above.',
      ),
    ).toBeInTheDocument();
    expect(FOOTER_CREDIT).toMatch(
      /working with global partners listed above\.$/,
    );
  });

  it('shows the method reference as a Sources section, linked by name', () => {
    render(<SiteFooter />);

    const sources = within(screen.getByRole('region', { name: 'Sources' }));
    const item = sources.getByRole('listitem');
    expect(item.textContent).toBe(
      'Sievers, M., Brown, C.J., Buelow, C.A., Pearson, R.M., Turschwell, M.P., Adame, M.F., Griffiths, L., Holgate, B., Rayner, T.S., Tulloch, V.J.D., Roy Chowdhury, M., zu Ermgassen, P.S.E., Lee, S.Y., Lillebø, A.I., Mackey, B., Maxwell, P.S., Rajkaran, A., Sousa, A.I. and Connolly, R.M. (2021) ‘Global typologies of coastal wetland status to inform conservation and management’, Ecological Indicators, 131, p. 108141. Read the paper',
    );
    expect(within(item).getByText('Ecological Indicators').tagName).toBe('I');

    const link = sources.getByRole('link', { name: /^Read the paper/ });
    expect(link).toHaveTextContent('Read the paper');
    expect(link).toHaveAttribute(
      'href',
      'https://doi.org/10.1016/j.ecolind.2021.108141',
    );
    expect(link).toHaveAttribute(
      'title',
      'https://doi.org/10.1016/j.ecolind.2021.108141',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(/opens in a new tab/);
  });

  it('shows no acknowledgement placeholder', () => {
    const { container } = render(<SiteFooter />);

    expect(screen.queryByText(/Acknowledgement of support/)).toBeNull();
    expect(container.querySelector('.border-dashed')).toBeNull();
  });

  it('shows the live dataset version from the store manifest', () => {
    render(<SiteFooter />);

    expect(screen.getByText('Dataset version')).toBeInTheDocument();
    expect(screen.getByText('v2026.09.0')).toHaveAttribute(
      'title',
      'Loaded live from the data store',
    );
  });

  it('omits the dataset version until the manifest resolves', () => {
    vi.mocked(useDatasetVersion).mockReturnValue(null);
    render(<SiteFooter />);

    expect(screen.queryByText(/Dataset version/)).toBeNull();
  });
});

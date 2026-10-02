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

  it('renders the six footer links and the developer credit verbatim', () => {
    render(<SiteFooter />);

    const nav = within(screen.getByRole('navigation', { name: 'Footer' }));
    expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'About',
      'Methods',
      'FAQ',
      'Contact',
      'Licence',
      'How to cite',
    ]);
    expect(nav.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '#faq',
    );
    expect(
      screen.getByText(
        'MBCAM is developed by the Global Wetlands Project at Griffith University and the University of the Western Cape, with partners worldwide.',
      ),
    ).toBeInTheDocument();
    expect(FOOTER_CREDIT).toMatch(/with partners worldwide\.$/);
  });

  it('flags the acknowledgement as a placeholder until supplied', () => {
    render(<SiteFooter />);

    expect(
      screen.getByText('Acknowledgement of support — wording to be agreed'),
    ).toHaveClass('border-dashed', 'border-amber-400');
  });

  it('shows supplied copy plainly, with no placeholder styling left', () => {
    const { container } = render(
      <SiteFooter acknowledgement="Supported by a grant." />,
    );

    expect(screen.getByText('Supported by a grant.')).toBeInTheDocument();
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

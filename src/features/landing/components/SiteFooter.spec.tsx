import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FOOTER_CREDIT } from '../config/footer';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
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

  it('flags the acknowledgement and dataset version as placeholders until supplied', () => {
    render(<SiteFooter />);

    for (const text of [
      'Acknowledgement of support — wording to be agreed',
      'v#.# — not yet supplied',
    ]) {
      expect(screen.getByText(text)).toHaveClass(
        'border-dashed',
        'border-amber-400',
      );
    }
  });

  it('shows supplied copy plainly, with no placeholder styling left', () => {
    const { container } = render(
      <SiteFooter
        acknowledgement="Supported by a grant."
        datasetVersion="v1.2"
      />,
    );

    expect(screen.getByText('Supported by a grant.')).toBeInTheDocument();
    expect(screen.getByText(/Dataset version:\s*v1\.2/)).toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).toBeNull();
  });
});

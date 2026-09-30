import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FAQS } from '../config/faqs';
import { Faqs } from './Faqs';

describe('Faqs', () => {
  it('shows the first 8 questions, then the rest on request', () => {
    const { container } = render(<Faqs />);

    expect(
      screen.getByRole('region', { name: 'Frequently asked questions' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('details')).toHaveLength(8);

    const toggle = screen.getByRole('button', {
      name: 'Show 5 more questions',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(container.querySelectorAll('details')).toHaveLength(13);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Show fewer questions');

    fireEvent.click(toggle);
    expect(container.querySelectorAll('details')).toHaveLength(8);
  });

  it('renders every question with its answer, and a placeholder for the three pending ones', () => {
    const { container } = render(<Faqs />);
    fireEvent.click(screen.getByRole('button', { name: /more questions/i }));

    const items = container.querySelectorAll('details');
    expect(items).toHaveLength(13);

    FAQS.forEach((faq, index) => {
      const item = within(items[index] as HTMLElement);
      expect(item.getByText(faq.question)).toBeInTheDocument();
      if (faq.answer) expect(item.getByText(faq.answer)).toBeInTheDocument();
    });

    const pending = Array.from(items)
      .filter((item) =>
        within(item as HTMLElement).queryByText('To be confirmed'),
      )
      .map((item) => item.querySelector('summary')?.textContent);
    expect(pending).toEqual([
      'Can I download the data?',
      'How do I cite MBCAM?',
      'Can my organisation contribute monitoring data?',
    ]);
  });

  it('keeps the citation question separate from the Sievers et al. method reference', () => {
    const cite = FAQS.find((faq) => faq.question === 'How do I cite MBCAM?');
    expect(cite?.answer).toBeNull();
    expect(
      FAQS.find((faq) => faq.question === 'Where does the data come from?')
        ?.answer,
    ).toMatch(/Sievers and colleagues in 2021/);
  });

  it('hides the toggle when every question already fits', () => {
    render(
      <Faqs faqs={[{ question: 'Only?', answer: 'A' }]} initiallyVisible={8} />,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('expands each question independently', () => {
    const { container } = render(
      <Faqs
        faqs={[
          { question: 'One?', answer: 'A1' },
          { question: 'Two?', answer: 'A2' },
        ]}
      />,
    );

    const [one, two] = container.querySelectorAll('details');
    fireEvent.click(screen.getByText('One?'));
    fireEvent.click(screen.getByText('Two?'));
    expect(one).toHaveAttribute('open');
    expect(two).toHaveAttribute('open');
  });
});

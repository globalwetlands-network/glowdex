import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FAQ_GROUPS } from '../config/faqs';
import { Faqs } from './Faqs';

const ALL_FAQS = FAQ_GROUPS.flatMap((group) => group.faqs);

function groupHeadings() {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);
}

describe('Faqs', () => {
  it('shows the first 5 questions, then the rest on request', () => {
    const { container } = render(<Faqs />);

    expect(
      screen.getByRole('region', { name: 'Frequently asked questions' }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('details')).toHaveLength(5);

    const toggle = screen.getByRole('button', {
      name: 'Show 6 more questions',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(container.querySelectorAll('details')).toHaveLength(11);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Show fewer questions');

    fireEvent.click(toggle);
    expect(container.querySelectorAll('details')).toHaveLength(5);
  });

  it('shows a group heading only once any of its questions is visible', () => {
    render(<Faqs />);
    expect(groupHeadings()).toEqual([
      'About MBCAM',
      'How it works',
      'Data & methods',
    ]);

    fireEvent.click(screen.getByRole('button', { name: /more questions/i }));
    expect(groupHeadings()).toEqual([
      'About MBCAM',
      'How it works',
      'Data & methods',
      'Download, cite & contribute',
    ]);
  });

  it('renders every question with its answer, in group order', () => {
    const { container } = render(<Faqs />);
    fireEvent.click(screen.getByRole('button', { name: /more questions/i }));

    const items = container.querySelectorAll('details');
    expect(items).toHaveLength(ALL_FAQS.length);

    ALL_FAQS.forEach((faq, index) => {
      const item = within(items[index] as HTMLElement);
      expect(item.getByText(faq.question)).toBeInTheDocument();
      // Bracketed gaps render as placeholders: same words, no brackets.
      const answer = items[index].querySelector('p')?.textContent ?? '';
      expect(answer.replaceAll('Coming soon', '')).toBe(
        faq.answer?.replace(/\[([^\]]+)\]/g, '$1'),
      );
    });
    expect(screen.queryByText('To be confirmed')).toBeNull();
  });

  it('hides the questions kept back until confirmed', () => {
    render(<Faqs />);
    fireEvent.click(screen.getByRole('button', { name: /more questions/i }));

    expect(
      screen.queryByText('How confident is the classification?'),
    ).toBeNull();
    expect(
      screen.queryByText(
        "What's the difference between the Global assessments and Local wildlife data?",
      ),
    ).toBeNull();
  });

  it('marks each bracketed gap as a placeholder with a "Coming soon" tooltip', () => {
    render(<Faqs />);
    fireEvent.click(screen.getByRole('button', { name: /more questions/i }));

    for (const gap of [
      'licence to be confirmed',
      'Contact method to be confirmed',
    ]) {
      const placeholder = screen.getByText(gap);
      expect(placeholder).toHaveClass('border-dashed');
      expect(placeholder).toHaveAccessibleDescription('Coming soon');
    }
    expect(screen.queryByText(/\[/)).toBeNull();
  });

  it('keeps the citation answer separate from the Sievers et al. method reference', () => {
    const answerTo = (question: string) =>
      ALL_FAQS.find((faq) => faq.question === question)?.answer;

    expect(answerTo('How do I cite MBCAM?')).not.toMatch(/Sievers/);
    expect(answerTo('Where does the data come from?')).toMatch(
      /Sievers and colleagues in 2021/,
    );
  });

  it('shows a placeholder for an answer still to be decided', () => {
    render(
      <Faqs
        groups={[
          { heading: 'Group', faqs: [{ question: 'Pending?', answer: null }] },
        ]}
      />,
    );

    expect(screen.getByText('To be confirmed')).toBeInTheDocument();
  });

  it('hides the toggle when every question already fits', () => {
    render(
      <Faqs
        groups={[
          { heading: 'Group', faqs: [{ question: 'Only?', answer: 'A' }] },
        ]}
        initiallyVisible={8}
      />,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('expands each question independently', () => {
    const { container } = render(
      <Faqs
        groups={[
          {
            heading: 'Group',
            faqs: [
              { question: 'One?', answer: 'A1' },
              { question: 'Two?', answer: 'A2' },
            ],
          },
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

import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXAMPLE_STEPS } from './content';
import { SeeItInAction } from './SeeItInAction';

// Plotly needs a real canvas; the chart's own wrapper markup still renders.
vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plot" />,
}));
const capture = vi.hoisted(() => vi.fn());
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture }),
}));

beforeEach(() => capture.mockClear());

function renderSection() {
  return render(
    <MemoryRouter>
      <SeeItInAction />
    </MemoryRouter>,
  );
}

/** Queries scoped to the carousel's current slide. */
function slide() {
  const el = document.querySelector<HTMLElement>('[data-example-target]');
  if (!el) throw new Error('No carousel slide rendered');
  return { target: el.dataset.exampleTarget, ...within(el) };
}

const next = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Next step' }));

/** Jumps to a step by clicking it in the step list. */
const goToStep = (label: string) =>
  fireEvent.click(
    within(screen.getByRole('list', { name: 'Steps' })).getByRole('button', {
      name: label,
    }),
  );

describe('SeeItInAction carousel', () => {
  it('starts on the local site tooltip for Bayhead', () => {
    renderSection();

    expect(
      screen.getByRole('heading', { name: 'See it in action' }),
    ).toBeInTheDocument();
    expect(slide().target).toBe('site-tooltip');
    expect(slide().getByText('Bayhead')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: EXAMPLE_STEPS.local[0].label }),
    ).toHaveAttribute('aria-current', 'step');
    expect(
      screen.getByText(`Step 1 of 3: ${EXAMPLE_STEPS.local[0].label}`),
    ).toBeInTheDocument();
  });

  it('steps through the real local components and wraps around', () => {
    renderSection();

    next();
    expect(slide().target).toBe('local-chart');
    expect(slide().getByText(/local wetlands analysis/i)).toBeInTheDocument();

    next();
    expect(slide().target).toBe('assistant');
    expect(
      slide().getByText('Mangrove Analysis Assistant'),
    ).toBeInTheDocument();
    expect(slide().getByText('Cell ID: 21812')).toBeInTheDocument();

    next();
    expect(slide().target).toBe('site-tooltip');

    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(slide().target).toBe('assistant');
  });

  it('jumps to a step from the step list', () => {
    renderSection();
    const label = EXAMPLE_STEPS.local[1].label;

    goToStep(label);

    expect(slide().target).toBe('local-chart');
    expect(screen.getByRole('button', { name: label })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(
      screen.getByRole('button', { name: EXAMPLE_STEPS.local[0].label }),
    ).not.toHaveAttribute('aria-current');
    expect(screen.getByText(`Step 2 of 3: ${label}`)).toBeInTheDocument();
  });

  it('switches to the global steps, restarting at step 1', () => {
    renderSection();
    next();

    fireEvent.click(screen.getByRole('button', { name: 'Global assessment' }));
    expect(
      screen.getByRole('button', { name: 'Global assessment' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(screen.getByRole('list', { name: 'Steps' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(EXAMPLE_STEPS.global.length);

    expect(slide().target).toBe('tile-tooltip');
    expect(slide().getByText('Tile ID: 21812')).toBeInTheDocument();

    next();
    expect(slide().target).toBe('typology-panel');
    expect(slide().getByText('21812')).toBeInTheDocument();

    next();
    expect(slide().target).toBe('global-chart');
    expect(
      slide().getByText('Ecological Structure and Function'),
    ).toBeInTheDocument();
    expect(slide().getAllByTestId('plot').length).toBeGreaterThan(0);
  });

  it('shows the assistant read-only, linking to the map', () => {
    renderSection();
    goToStep(EXAMPLE_STEPS.local[2].label);

    expect(
      slide().getByPlaceholderText('Ask a follow-up question...'),
    ).toBeDisabled();
    expect(
      slide().getByRole('link', { name: /try it in the map/i }),
    ).toHaveAttribute('href', '/map');
  });
});

describe('showcase analytics', () => {
  it('shows the local widget without live controls', () => {
    renderSection();
    goToStep(EXAMPLE_STEPS.local[1].label);

    expect(slide().queryByRole('switch')).not.toBeInTheDocument();
    expect(slide().getByRole('combobox', { name: 'Country' })).toBeDisabled();
    expect(
      slide().getByRole('combobox', { name: 'Monitoring location' }),
    ).toBeDisabled();
  });

  it('captures no events when the source link is clicked', () => {
    renderSection();
    goToStep(EXAMPLE_STEPS.local[2].label);
    fireEvent.click(slide().getByRole('link', { name: /Sievers et al/ }));

    expect(capture).not.toHaveBeenCalled();
  });
});

describe('carousel assistant', () => {
  const highlight =
    'exceptionally low fish density compared to similar systems in its typology';

  it('shows the local summary, highlighted, with the local-data chip', () => {
    renderSection();
    goToStep(EXAMPLE_STEPS.local[2].label);

    expect(
      slide().getByText(highlight, { selector: 'mark' }),
    ).toBeInTheDocument();
    expect(
      slide().getByText(/Local field data from Bayhead/),
    ).toBeInTheDocument();
    expect(
      slide().getByRole('button', {
        name: 'What does the local field data show?',
      }),
    ).toBeInTheDocument();
  });

  it('shows a global-only summary, highlighted, without the local-data chip', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: 'Global assessment' }));
    goToStep(EXAMPLE_STEPS.global[3].label);

    expect(
      slide().getByText(highlight, { selector: 'mark' }),
    ).toBeInTheDocument();
    expect(slide().getByText(/covers 64 hectares/)).toBeInTheDocument();
    expect(slide().queryByText(/Local field data/)).not.toBeInTheDocument();
    expect(
      slide().queryByRole('button', {
        name: 'What does the local field data show?',
      }),
    ).not.toBeInTheDocument();
  });
});

describe('Ask the assistant explainer', () => {
  it('shows the Beta explainer for the same place, with no AI logos', () => {
    const { container } = renderSection();

    expect(
      screen.getByRole('heading', { name: 'Ask the assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    for (const title of [
      'You select a place',
      'It reads the data for that place',
      'It explains what stands out',
      'You can ask follow-up questions',
    ]) {
      expect(screen.getByText(new RegExp(title))).toBeInTheDocument();
    }
    expect(screen.getByText('Bayhead, South Africa')).toBeInTheDocument();
    expect(screen.getByText('Tile 21812')).toBeInTheDocument();
    expect(screen.getByText('Fish density')).toBeInTheDocument();
    expect(screen.getByText('9th')).toBeInTheDocument();
    // Step 3's card quotes the real response, highlighting the key finding.
    expect(
      screen.getByText('Exceptionally low fish density', { selector: 'mark' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByAltText(/chatgpt|claude|gemini|grok/i),
    ).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('22654');
  });
});

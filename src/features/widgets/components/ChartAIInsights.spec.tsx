import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChartAIInsights } from './ChartAIInsights';

describe('ChartAIInsights', () => {
  const defaultProps = {
    indicatorName: 'Mangrove Fish Density',
    value: 50,
    percentile: 50,
    q1: 20,
    q3: 80,
    selectedCellId: 1,
    onAskAI: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders no badges when value is normal (between q1 and q3, low percentile)', () => {
    render(<ChartAIInsights {...defaultProps} />);
    expect(screen.queryByTestId('insight-badge')).not.toBeInTheDocument();
  });

  it('shows warning badge when percentile >= 95', () => {
    render(<ChartAIInsights {...defaultProps} percentile={98} />);
    const badge = screen.getByTestId('insight-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('98th percentile for this typology');
  });

  it('shows insight badge when value > q3', () => {
    render(
      <ChartAIInsights {...defaultProps} value={90} q3={80} percentile={85} />,
    );
    const badge = screen.getByTestId('insight-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Value above the upper quartile');
  });

  it('shows warning badge when value < q1', () => {
    render(
      <ChartAIInsights {...defaultProps} value={10} q1={20} percentile={10} />,
    );
    const badge = screen.getByTestId('insight-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Value below the lower quartile');
  });

  it('prioritizes percentile badge over q3 badge if both apply', () => {
    render(
      <ChartAIInsights {...defaultProps} value={100} q3={80} percentile={99} />,
    );
    const badge = screen.getByTestId('insight-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('99th percentile for this typology');
  });

  it('opens dropdown and fires onAskAI with formatted prompt', () => {
    render(<ChartAIInsights {...defaultProps} />);

    // Dropdown initially closed
    expect(screen.queryByTestId('ask-ai-dropdown')).not.toBeInTheDocument();

    // Click button to open
    fireEvent.click(screen.getByTestId('ask-ai-button'));
    expect(screen.getByTestId('ask-ai-dropdown')).toBeInTheDocument();

    // Click a preset
    fireEvent.click(
      screen.getByText(
        'What does the violin plot show about mangrove fish density in this location?',
      ),
    );

    // Expect callback to be called with exact prompt
    expect(defaultProps.onAskAI).toHaveBeenCalledWith(
      'What does the violin plot show about mangrove fish density in this location?',
    );

    // Dropdown closes after clicking
    expect(screen.queryByTestId('ask-ai-dropdown')).not.toBeInTheDocument();
  });

  it('opens dropdown when insight badge is clicked', () => {
    // Render with 98th percentile to show the warning badge
    render(<ChartAIInsights {...defaultProps} percentile={98} />);

    expect(screen.queryByTestId('ask-ai-dropdown')).not.toBeInTheDocument();

    const badge = screen.getByTestId('insight-badge');
    fireEvent.click(badge);

    expect(screen.getByTestId('ask-ai-dropdown')).toBeInTheDocument();
  });
});

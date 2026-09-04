import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DataUnavailable } from './DataUnavailable';

afterEach(cleanup);

describe('DataUnavailable', () => {
  it('renders the error state with a connection-focused message', () => {
    render(<DataUnavailable onRetry={vi.fn()} />);

    expect(screen.getByText(/couldn't load the map data/i)).toBeInTheDocument();
    expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows the error message as diagnostic detail when provided', () => {
    render(
      <DataUnavailable
        error={new Error('Could not reach the data store')}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Could not reach the data store'),
    ).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<DataUnavailable onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

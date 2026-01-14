import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Button component
const Button = ({ 
  onClick, 
  disabled, 
  children,
  variant = 'primary',
  loading = false,
}: { 
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={variant}
      data-loading={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('is enabled by default', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText('Click Me');
    expect(button).toBeEnabled();
  });

  it('can be disabled', () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByText('Click Me');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click Me</Button>);
    const button = screen.getByText('Loading...');
    expect(button).toBeDisabled();
  });

  it('applies correct variant class', () => {
    render(<Button variant="secondary">Click Me</Button>);
    const button = screen.getByText('Click Me');
    expect(button).toHaveClass('secondary');
  });
});

describe('Button - Edge Cases', () => {
  it('handles rapid clicks correctly', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    
    // Simulate rapid clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('can be re-enabled after being disabled', () => {
    const { rerender } = render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
    
    rerender(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeEnabled();
  });
});

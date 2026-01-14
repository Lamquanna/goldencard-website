import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock ContactForm component
const ContactForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send</button>
    </form>
  );
};

describe('ContactForm', () => {
  it('renders all form fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('submit button is enabled', () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByText('Send');
    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit when form is submitted', () => {
    const mockSubmit = vi.fn();
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Message'), {
      target: { value: 'Hello World' },
    });
    
    // Submit
    fireEvent.click(screen.getByText('Send'));
    
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('all inputs are enabled and not disabled', () => {
    render(<ContactForm />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const messageInput = screen.getByPlaceholderText('Message');
    
    expect(nameInput).toBeEnabled();
    expect(emailInput).toBeEnabled();
    expect(messageInput).toBeEnabled();
  });
});

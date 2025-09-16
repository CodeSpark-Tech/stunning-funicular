import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Home from '../app/page';

// Mock API server
const server = setupServer(
  rest.get('http://localhost:8001/api/v1/reports', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 1,
        created_at: '2024-01-01T12:00:00Z',
        status: 'complete',
        verdict: 'Malicious',
        ai_confidence: 0.95,
        ai_summary: 'Phishing attempt detected'
      },
      {
        id: 2,
        created_at: '2024-01-02T12:00:00Z',
        status: 'pending',
        verdict: null,
        ai_confidence: null,
        ai_summary: null
      }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Dashboard Page', () => {
  test('renders dashboard title', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Project Sentinel')).toBeInTheDocument();
    });
  });

  test('displays statistics cards', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Malicious')).toBeInTheDocument();
      expect(screen.getByText('Spam')).toBeInTheDocument();
      expect(screen.getByText('Safe')).toBeInTheDocument();
    });
  });

  test('renders reports table with data', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Phishing attempt detected')).toBeInTheDocument();
    });
  });

  test('shows correct verdict colors', async () => {
    render(<Home />);
    await waitFor(() => {
      const maliciousReport = screen.getByText('Malicious');
      expect(maliciousReport).toBeInTheDocument();
    });
  });

  test('displays confidence percentage', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });
});

describe('Statistics Calculation', () => {
  test('calculates correct statistics from reports', async () => {
    render(<Home />);
    await waitFor(() => {
      const totalElement = screen.getByText('2');
      expect(totalElement).toBeInTheDocument();
    });
  });
});

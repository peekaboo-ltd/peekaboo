import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KpayPaymentStatus } from '@/types/payment.types';
import PublicOrderPaymentSuccess from './PublicOrderPaymentSuccess';

const mocks = vi.hoisted(() => ({
  status: '03',
}));

vi.mock('@/api/queries/payments.queries', () => ({
  useGetPublicPaymentStatusQuery: ({ paymentId }: { paymentId: string }) => ({
    data: paymentId
      ? {
          data: {
            id: paymentId,
            entityId: 'order-1',
            amount: 2500,
            currency: 'RWF',
            status: mocks.status,
            provider: 'URUBUTO',
            method: 'MOMO',
            updatedAt: '2026-08-17T00:00:00.000Z',
          },
        }
      : undefined,
    error: undefined,
    isLoading: false,
    isFetching: false,
  }),
}));

vi.mock('@/hooks/common/useDocumentTitle', () => ({
  useDocumentTitle: vi.fn(),
}));

vi.mock('@/hooks/orders/orders.hooks', () => ({
  useGetPublicOrder: () => ({
    getPublicOrder: vi.fn(),
    isFetching: false,
  }),
}));

vi.mock('@/states/hooks', () => ({
  useAppSelector: () => ({
    order: {
      id: 'order-1',
      referenceId: 'PKB-001',
      initialFee: 2500,
    },
  }),
}));

vi.mock('@/containers/locations/AdministrativeLocation', () => ({
  default: () => null,
}));

const renderSuccessPage = (query = '?paymentId=payment-1') =>
  render(
    <MemoryRouter
      initialEntries={[`/p/orders/order-1/payment-success${query}`]}
    >
      <Routes>
        <Route
          path="/p/orders/:id/payment-success"
          element={<PublicOrderPaymentSuccess />}
        />
        <Route
          path="/p/orders/:id/payment-pending"
          element={<div>Pending payment route</div>}
        />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicOrderPaymentSuccess guards', () => {
  beforeEach(() => {
    mocks.status = KpayPaymentStatus.PENDING;
  });

  it('sends an unconfirmed payment back to its pending page', async () => {
    renderSuccessPage();

    expect(await screen.findByText('Pending payment route')).toBeInTheDocument();
  });

  it('does not show a receipt when the exact payment ID is missing', () => {
    renderSuccessPage('');

    expect(
      screen.getByRole('heading', { name: /payment confirmation unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/payment confirmed/i)).not.toBeInTheDocument();
  });
});

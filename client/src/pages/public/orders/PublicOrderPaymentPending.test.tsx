import { render, screen, waitFor } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  KpayPaymentStatus,
  PaymentChannel,
  PaymentProvider,
} from '@/types/payment.types';
import PublicOrderPaymentPending from './PublicOrderPaymentPending';

const mocks = vi.hoisted(() => ({
  status: '03',
  error: undefined as unknown,
  refetch: vi.fn(),
  statusHook: vi.fn(),
}));

vi.mock('@/api/queries/payments.queries', () => ({
  useGetPublicPaymentStatusQuery: (...args: unknown[]) => {
    mocks.statusHook(...args);
    return {
      data: {
        data: {
          id: 'payment-1',
          entityId: 'order-1',
          amount: 2500,
          currency: 'RWF',
          externalReferenceId: 'urubuto-1',
          status: mocks.status,
          method: PaymentChannel.MOMO,
          provider: PaymentProvider.URUBUTO,
          updatedAt: '2026-08-17T00:00:00.000Z',
        },
      },
      error: mocks.error,
      isLoading: false,
      isFetching: false,
      refetch: mocks.refetch,
    };
  },
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

const renderPendingPage = () =>
  render(
    <MemoryRouter
      initialEntries={[
        '/p/orders/order-1/payment-pending?paymentId=payment-1',
      ]}
    >
      <Routes>
        <Route
          path="/p/orders/:id/payment-pending"
          element={<PublicOrderPaymentPending />}
        />
        <Route
          path="/p/orders/:id/payment-success"
          element={<div>Verified success route</div>}
        />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicOrderPaymentPending', () => {
  beforeEach(() => {
    mocks.status = KpayPaymentStatus.PENDING;
    mocks.error = undefined;
    mocks.refetch.mockReset();
    mocks.statusHook.mockClear();
  });

  it('polls the exact payment every three seconds and shows wallet guidance', () => {
    renderPendingPage();

    expect(
      screen.getByText(/approve the mobile money prompt/i),
    ).toBeInTheDocument();
    expect(mocks.statusHook).toHaveBeenCalledWith(
      { paymentId: 'payment-1', entityId: 'order-1' },
      expect.objectContaining({ pollingInterval: 3000 }),
    );
  });

  it('keeps polling through transient connection errors', () => {
    mocks.error = { status: 503 };
    renderPendingPage();

    expect(
      screen.getByText(/connection interrupted.*checking automatically/i),
    ).toBeInTheDocument();
    expect(mocks.statusHook).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ pollingInterval: 3000 }),
    );
  });

  it('checks immediately on focus and cleans up the focus listener', () => {
    const page = renderPendingPage();
    mocks.refetch.mockClear();

    window.dispatchEvent(new Event('focus'));
    expect(mocks.refetch).toHaveBeenCalledTimes(1);

    page.unmount();
    mocks.refetch.mockClear();
    window.dispatchEvent(new Event('focus'));
    expect(mocks.refetch).not.toHaveBeenCalled();
  });

  it('stops polling and offers a return path after provider failure', async () => {
    mocks.status = KpayPaymentStatus.FAILED;
    renderPendingPage();

    expect(
      screen.getByRole('heading', { name: /payment was not completed/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to order/i })).toHaveAttribute(
      'href',
      '/p/orders/order-1',
    );
    await waitFor(() =>
      expect(mocks.statusHook).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ pollingInterval: 0 }),
      ),
    );
  });

  it('replaces the pending route only after webhook-confirmed success', async () => {
    mocks.status = KpayPaymentStatus.SUCCESSFUL;
    renderPendingPage();

    expect(
      await screen.findByText('Verified success route'),
    ).toBeInTheDocument();
  });
});

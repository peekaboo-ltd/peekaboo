import { useI18n } from '@/i18n/i18n';

const DashboardError = () => {
  const { t } = useI18n();

  return (
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <article className="relative overflow-hidden rounded-2xl border border-rose-100 bg-[var(--peekaboo-surface)] px-4 py-10 text-center shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:px-8 sm:py-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{t('dashboard.failedToLoad')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('dashboard.tryRefreshing')}</p>
      </article>
    </main>
  );
};

export default DashboardError;

import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoading = () => {
  return (
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <section className="mb-6 sm:mb-8">
        <Skeleton className="h-28 sm:h-32 rounded-2xl" />
      </section>

      <section aria-label="Loading metrics" className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>

      <section aria-label="Loading charts" className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Skeleton className="h-60 sm:h-72 rounded-xl" />
        <Skeleton className="h-60 sm:h-72 rounded-xl" />
      </section>
    </main>
  );
};

export default DashboardLoading;

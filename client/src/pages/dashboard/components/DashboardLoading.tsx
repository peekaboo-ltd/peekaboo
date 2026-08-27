import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoading = () => {
  return (
    <main className="w-full">
      <section className="mb-6 sm:mb-8">
        <Skeleton className="h-48 rounded-lg bg-(--surface)" />
      </section>

      <section aria-label="Loading metrics" className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-60 rounded-lg bg-(--surface)" />
          ))}
        </div>
      </section>

      <section aria-label="Loading charts" className="grid grid-cols-12 gap-4">
        <Skeleton className="col-span-12 h-[28rem] rounded-lg bg-(--surface) xl:col-span-8" />
        <div className="col-span-12 grid gap-4 xl:col-span-4">
          <Skeleton className="h-[13.5rem] rounded-lg bg-(--surface)" />
          <Skeleton className="h-[13.5rem] rounded-lg bg-(--surface)" />
        </div>
      </section>

      <section aria-label="Loading secondary content" className="mt-4 grid grid-cols-12 gap-4">
        <Skeleton className="col-span-12 h-[24rem] rounded-lg bg-(--surface) xl:col-span-8" />
        <Skeleton className="col-span-12 h-[24rem] rounded-lg bg-(--surface) xl:col-span-4" />
      </section>
    </main>
  );
};

export default DashboardLoading;

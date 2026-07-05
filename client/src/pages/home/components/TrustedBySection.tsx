interface TrustedBySectionProps {
  label: string;
  industries: string[];
}

const TrustedBySection = ({ label, industries }: TrustedBySectionProps) => (
  <section className="w-full bg-card">
    <article className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
      <p className="text-[11px] font-normal uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {industries.map((industry) => (
          <li
            key={industry}
            className="text-[11px] font-normal uppercase tracking-[0.04em] text-muted-foreground sm:text-[12px]"
          >
            {industry}
          </li>
        ))}
      </ul>
    </article>
  </section>
);

export default TrustedBySection;

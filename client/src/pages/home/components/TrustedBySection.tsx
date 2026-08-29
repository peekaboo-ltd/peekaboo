interface TrustedBySectionProps {
  label: string;
  industries: string[];
}

const TrustedBySection = ({ label, industries }: TrustedBySectionProps) => (
  <section className="w-full border-y border-(--line) bg-(--paper)">
    <article className="app-container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <p className="type-eyebrow">
        {label}
      </p>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {industries.map((industry) => (
          <li
            key={industry}
            className="text-xs font-normal text-muted-foreground sm:text-xs"
          >
            {industry}
          </li>
        ))}
      </ul>
    </article>
  </section>
);

export default TrustedBySection;

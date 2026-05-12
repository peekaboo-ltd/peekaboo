interface TrustedBySectionProps {
  label: string;
  industries: string[];
}

const TrustedBySection = ({ label, industries }: TrustedBySectionProps) => (
  <section className="w-full border-b border-[#ececea] bg-white">
    <article className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
        {label}
      </p>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {industries.map((industry) => (
          <li
            key={industry}
            className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#3a3a3a]/70 sm:text-[12px]"
          >
            {industry}
          </li>
        ))}
      </ul>
    </article>
  </section>
);

export default TrustedBySection;

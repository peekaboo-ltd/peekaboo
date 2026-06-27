import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RwandaCoverageMap from './RwandaCoverageMap';

const cities = [
  { name: 'Kigali', value: '32K /mo', live: true },
  { name: 'Musanze', value: '3.2K /mo', live: true },
  { name: 'Huye', value: '2.8K /mo', live: true },
  { name: 'Rubavu', value: '1.9K /mo', live: true },
  { name: 'Nyagatare', value: '1.4K /mo', live: true },
  { name: 'Rusizi', value: 'Q3 2026', live: false },
  { name: 'Karongi', value: 'Q4 2026', live: false },
];

const CoverageSection = () => (
  <section
    id="coverage"
    className="relative w-full overflow-hidden border-t border-[#ececea] bg-white py-10 lg:py-14"
  >
    <figure
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_360px_at_85%_20%,rgba(255,196,0,0.08),transparent_60%)]"
      aria-hidden="true"
    />
    <article className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
          Coverage
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[40px]">
          Delivering
          <br />
          beyond Kigali.
        </h2>
        <p className="mt-4 max-w-[470px] text-[13px] leading-relaxed text-[#6b6f76]">
          Peekaboo&apos;s rider network now reaches every province capital. Schedule
          next-day drops to Musanze, Huye, Rubavu and beyond with the same tracking
          experience.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#ffc400] border border-[#ffc400] px-5 py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition hover:bg-[#e6ad00] hover:border-[#e6ad00]"
          >
            Request a route
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <a
            href="#coverage"
            className="inline-flex items-center rounded-full border border-[#ececea] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0a0a0a] transition hover:bg-[#f7f6f1] hover:border-[#d9d8d4]"
          >
            View coverage
          </a>
        </nav>
      </header>

      <aside>
        <figure className="relative h-[280px] overflow-hidden rounded-[20px] border border-[#ececea] bg-[var(--peekaboo-warm)]">
          <RwandaCoverageMap className="h-full w-full" variant="light" />
        </figure>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li
              key={city.name}
              className="flex items-center justify-between rounded-[10px] border border-[#ececea] bg-[var(--peekaboo-warm)] px-3.5 py-2.5"
            >
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0a]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    city.live ? 'bg-[#ffc400]' : 'bg-[#9e9d98]'
                  }`}
                />
                {city.name}
              </span>
              <span className="font-mono text-[11px] text-[#6b6f76]">{city.value}</span>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  </section>
);

export default CoverageSection;

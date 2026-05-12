import { ArrowRight } from 'lucide-react';
import ImageSlot from './ImageSlot';
import Button from '@/components/inputs/Button';

const pins = [
  { x: '32%', y: '62%', label: 'Kigali', live: true },
  { x: '26%', y: '30%', label: 'Musanze', live: true },
  { x: '44%', y: '76%', label: 'Huye', live: true },
  { x: '12%', y: '44%', label: 'Rubavu', live: true },
  { x: '62%', y: '26%', label: 'Nyagatare', live: true },
  { x: '10%', y: '70%', label: 'Rusizi', live: false },
];

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
    className="relative w-full overflow-hidden bg-[#0a0a0a] py-10 text-white lg:py-14"
  >
    <figure
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_30%,rgba(255,196,0,0.16),transparent_60%)]"
      aria-hidden="true"
    />
    <article className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffc400]">
          Coverage
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-[40px]">
          Delivering
          <br />
          beyond Kigali.
        </h2>
        <p className="mt-4 max-w-[470px] text-[13px] leading-relaxed text-white/70">
          Peekaboo's rider network now reaches every province capital. Schedule
          next-day drops to Musanze, Huye, Rubavu and beyond with the same tracking
          experience.
        </p>
        <nav className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            className="rounded-full bg-[#ffc400] border-[#ffc400] text-[#0a0a0a] hover:bg-[#e6ad00] hover:border-[#e6ad00] font-semibold"
          >
            Open coverage map
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            className="rounded-full border-white/25 text-white hover:bg-white/[0.06] hover:border-white/25"
          >
            Request a route
          </Button>
        </nav>
      </header>

      <aside>
        <figure className="relative h-[280px] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]">
          <ImageSlot
            label="map · rwanda coverage outline"
            dark
            className="absolute inset-0 h-full w-full rounded-none border-0"
          />
          {pins.map((pin) => (
            <span
              key={pin.label}
              className="absolute"
              style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}
            >
              <span
                className={`block h-3 w-3 rounded-full ${
                  pin.live
                    ? 'bg-[#ffc400] shadow-[0_0_0_6px_rgba(255,196,0,0.18)]'
                    : 'bg-white/40'
                }`}
              />
              <span className="absolute left-5 top-[-3px] whitespace-nowrap text-[11px] font-semibold text-white/85">
                {pin.label}
              </span>
            </span>
          ))}
        </figure>

        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li
              key={city.name}
              className="flex items-center justify-between rounded-[10px] border border-white/[0.08] px-3.5 py-2.5"
            >
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    city.live ? 'bg-[#ffc400]' : 'bg-white/30'
                  }`}
                />
                {city.name}
              </span>
              <span className="font-mono text-[11px] text-white/55">{city.value}</span>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  </section>
);

export default CoverageSection;

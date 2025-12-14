import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { stats, heroContent } from '../constants/hero.constants';
import { MultiStepOrderForm } from '@/pages/home/components/MultiStepOrderForm/index';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
          {/* Left Content */}
          <article className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <header className="space-y-4 sm:space-y-6">
              <div className="inline-block">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs sm:text-sm font-medium">
                  {heroContent.badge}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {heroContent.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-primary-100">
                  {heroContent.highlightedTitle}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-primary-100 max-w-xl">
                {heroContent.subtitle}
              </p>

              {/* Simplified Urgency Indicator */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs sm:text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></span>
                {heroContent.urgencyText}
              </div>
            </header>

            {/* Stats Grid */}
            <aside className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4" aria-label="Statistics">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 sm:p-3 lg:p-4 text-center"
                >
                  <FontAwesomeIcon icon={stat.icon} className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto mb-1 sm:mb-2 ${stat.color}`} aria-hidden="true" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-primary-200 mt-0.5 sm:mt-1">{stat.label}</div>
                </div>
              ))}
            </aside>

            {/* Simplified CTA Buttons */}
            <nav className="flex flex-wrap gap-4 lg:hidden">
              <a
                href="#how-it-works"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm sm:text-base cursor-pointer"
              >
                {heroContent.secondaryButtonText}
              </a>
            </nav>
          </article>

          {/* Right Content - Order Form */}
          <aside className="flex items-center justify-center order-1 lg:order-2">
            <MultiStepOrderForm />
          </aside>
        </div>
      </div>
    </section>
  );
};

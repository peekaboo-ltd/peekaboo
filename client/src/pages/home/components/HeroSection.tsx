import { stats, heroContent } from '../constants/hero.constants';
import { MultiStepOrderForm } from '@/pages/home/components/MultiStepOrderForm/index';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium">
                  {heroContent.badge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {heroContent.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  {heroContent.highlightedTitle}
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-xl">
                {heroContent.subtitle}
              </p>

              {/* Simplified Urgency Indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {heroContent.urgencyText}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 lg:p-4 text-center"
                >
                  <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-xl lg:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Simplified CTA Buttons */}
            <div className="flex flex-wrap gap-4 lg:hidden">
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                {heroContent.secondaryButtonText}
              </a>
            </div>
          </div>

          {/* Right Content - Order Form */}
          <div className="flex items-center justify-center order-1 lg:order-2">
            <MultiStepOrderForm />
          </div>
        </div>
      </div>
    </section>
  );
};

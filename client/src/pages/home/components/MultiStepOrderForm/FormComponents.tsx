import { Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          return (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                step < currentStep
                  ? 'bg-green-500 text-white'
                  : step === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
          );
        })}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <p className="text-xs text-center text-gray-600 mt-2">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
};

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const NavigationButtons = ({ currentStep, totalSteps, isLoading, onBack, onNext }: NavigationButtonsProps) => {
  return (
    <div className="flex gap-2 mt-6">
      {currentStep > 1 && (
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <button
        onClick={onNext}
        disabled={isLoading}
        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : currentStep === totalSteps ? (
          <>
            Confirm Order
            <Check className="w-4 h-4" />
          </>
        ) : currentStep === 3 ? (
          <>
            Pay with Kpay
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

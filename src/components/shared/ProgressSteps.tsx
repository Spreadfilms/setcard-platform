"use client";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Verbindungslinie */}
        <div className="absolute top-5 left-0 right-0 h-px bg-[#E5E5E5] z-0" />
        <div
          className="absolute top-5 left-0 h-px bg-[#0A0A0A] z-0 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center gap-2 z-10 relative">
            {/* Kreis */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index < currentStep
                  ? "bg-[#0A0A0A] text-white"
                  : index === currentStep
                  ? "bg-[#0A0A0A] text-white ring-4 ring-[#0A0A0A]/20"
                  : "bg-white border-2 border-[#E5E5E5] text-[#737373]"
              }`}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-medium hidden sm:block ${
                index <= currentStep ? "text-[#0A0A0A]" : "text-[#737373]"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

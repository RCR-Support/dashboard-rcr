interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-6 border-t mt-6">
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        {currentStep === 0 ? 'Cancelar' : 'Atrás'}
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        {currentStep === totalSteps - 1 ? 'Finalizar' : 'Continuar'}
      </button>
    </div>
  );
}


interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (stepNumber: number) => void;
  isStepAccessible?: (stepNumber: number) => boolean;
}

const StepIndicator = ({
  currentStep,
  steps,
  onStepClick,
  isStepAccessible = () => true
}: StepIndicatorProps) => {
  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && isStepAccessible(stepNumber)) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="flex items-center justify-between mb-3 py-0">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= step.number 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-600'
              } ${
                isStepAccessible(step.number) 
                  ? 'cursor-pointer hover:bg-gray-800' 
                  : 'cursor-not-allowed'
              }`}
              onClick={() => handleStepClick(step.number)}
            >
              {step.number}
            </div>
            <div 
              className={`${isStepAccessible(step.number) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleStepClick(step.number)}
            >
              <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-black' : 'text-gray-500'}`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-px mx-4 ${currentStep > step.number ? 'bg-black' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;

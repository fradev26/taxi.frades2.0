import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, MapPin, Car, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingWizardStep {
  title: string;
  description: string;
}

interface BookingWizardProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  canAdvanceToStep2: () => boolean;
  canAdvanceToStep3: () => boolean;
  steps: BookingWizardStep[];
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  children,
  currentStep,
  totalSteps,
  onStepChange,
  canAdvanceToStep2,
  canAdvanceToStep3,
  steps
}) => {
  const stepIcons = [MapPin, Car, CreditCard];

  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return canAdvanceToStep2();
      case 3:
        return canAdvanceToStep3();
      default:
        return true;
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep || (step === currentStep + 1 && canAdvanceToStep(step))) {
      onStepChange(step);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canAdvanceToStep(currentStep + 1)) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Boek je rit</h2>
        <div className="mt-2">
          <h3 className="text-lg font-medium">{steps[currentStep - 1]?.title}</h3>
          <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const canAccess = step <= currentStep || (step === currentStep + 1 && canAdvanceToStep(step));
          const Icon = stepIcons[step - 1];
          
          return (
            <div key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={!canAccess}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all",
                  isCompleted 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : isActive 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : canAccess
                    ? "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                    : "border-muted text-muted cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </button>
              
              {step < totalSteps && (
                <div className={cn(
                  "w-8 h-0.5 mx-2 transition-colors",
                  step < currentStep ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Titles */}
      <div className="flex justify-between text-xs text-muted-foreground mb-6 px-4">
        {steps.map((step, index) => (
          <span 
            key={index}
            className={cn(
              "text-center max-w-20 truncate",
              currentStep === index + 1 ? "text-primary font-medium" : ""
            )}
          >
            {step.title}
          </span>
        ))}
      </div>

      {/* Step Content */}
      {children}

      {/* Navigation Controls */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Vorige
        </Button>
        
        {currentStep < totalSteps && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canAdvanceToStep(currentStep + 1)}
            className="flex items-center gap-2"
          >
            Volgende
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
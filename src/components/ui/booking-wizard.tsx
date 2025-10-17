import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, MapPin, Car, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingWizardStep {
  title: string;
  description?: string;
}

interface BookingWizardProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  canAdvanceToStep2?: () => boolean;
  canAdvanceToStep3?: () => boolean;
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

  // Create canProceedToStep function based on the step-specific functions
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2: return canAdvanceToStep2 ? canAdvanceToStep2() : true;
      case 3: return canAdvanceToStep3 ? canAdvanceToStep3() : true;
      default: return true;
    }
  };

  // Calculate completed steps based on current step and validation
  const completedSteps = [];
  for (let i = 1; i < currentStep; i++) {
    completedSteps.push(i);
  }
  // Add current step if we can proceed to next
  if (currentStep < totalSteps && canProceedToStep(currentStep + 1)) {
    completedSteps.push(currentStep);
  } else if (currentStep === totalSteps) {
    completedSteps.push(currentStep);
  }

  const handleStepClick = (step: number) => {
    if (step <= currentStep || (step === currentStep + 1 && canProceedToStep(step))) {
      onStepChange(step);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedToStep(currentStep + 1)) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isActive = step === currentStep;
            const isCompleted = completedSteps.includes(step);
            const canAccess = step <= currentStep || (step === currentStep + 1 && canProceedToStep(step));
            const Icon = stepIcons[step - 1];
            
            return (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step)}
                  disabled={!canAccess}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all",
                    isCompleted 
                      ? "bg-green-500 border-green-500 text-white" 
                      : isActive 
                      ? "bg-black border-black text-white" 
                      : canAccess
                      ? "border-gray-300 text-gray-600 hover:border-black hover:bg-gray-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>
                
                {step < totalSteps && (
                  <div className={cn(
                    "w-16 md:w-24 h-0.5 mx-2 transition-colors",
                    completedSteps.includes(step) ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-4 text-sm">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "text-center max-w-32",
                currentStep === index + 1 ? "text-black font-medium" : "text-gray-500"
              )}
            >
              <div className="font-medium">{step.title}</div>
              {step.description && (
                <div className="text-xs text-gray-400 mt-1">{step.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {children}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between pt-6 border-t">
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
        
        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToStep(currentStep + 1)}
              className="flex items-center gap-2"
            >
              Volgende
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!completedSteps.includes(totalSteps)}
              className="flex items-center gap-2"
            >
              Boeken
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
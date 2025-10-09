import React, { useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { format, addMinutes, setHours, setMinutes, startOfDay, isToday, isTomorrow } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DateTimeSelectorProps {
  selectedDate?: Date | null;
  selectedTime?: string;
  onDateChange?: (date: Date | null) => void;
  onTimeChange?: (time: string) => void;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
  placeholder?: {
    date?: string;
    time?: string;
  };
  showQuickActions?: boolean;
  timeStep?: number; // Minutes between time options (default: 15)
}

export const DateTimeSelector = React.memo(function DateTimeSelector({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate = new Date(),
  disabled = false,
  className = "",
  placeholder = {
    date: "Selecteer datum",
    time: "Selecteer tijd"
  },
  showQuickActions = true,
  timeStep = 15
}: DateTimeSelectorProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const { toast } = useToast();

  // Generate time options
  const timeOptions = React.useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const startTime = 6; // 6:00 AM
    const endTime = 24; // 12:00 AM (midnight)
    
    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += timeStep) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(setMinutes(setHours(new Date(), hour), minute), 'HH:mm');
        options.push({ value: timeString, label: displayTime });
      }
    }
    
    return options;
  }, [timeStep]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateChange?.(date);
      setDateOpen(false);
    }
  }, [onDateChange]);

  const handleTimeSelect = useCallback((time: string) => {
    onTimeChange?.(time);
  }, [onTimeChange]);

  const handleTodayClick = useCallback(() => {
    const today = new Date();
    onDateChange?.(today);
    setDateOpen(false);
    
    if (showQuickActions) {
      toast({
        title: "Datum ingesteld",
        description: "Vandaag is geselecteerd",
        duration: 2000,
      });
    }
  }, [onDateChange, showQuickActions, toast]);

  const handleTomorrowClick = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onDateChange?.(tomorrow);
    setDateOpen(false);
    
    if (showQuickActions) {
      toast({
        title: "Datum ingesteld", 
        description: "Morgen is geselecteerd",
        duration: 2000,
      });
    }
  }, [onDateChange, showQuickActions, toast]);

  const handleCurrentTimeClick = useCallback(() => {
    const now = new Date();
    // Round to next time interval
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / timeStep) * timeStep;
    const roundedTime = addMinutes(setMinutes(now, 0), roundedMinutes);
    
    // If we've rounded into the next hour, adjust accordingly
    const timeString = format(roundedTime, 'HH:mm');
    onTimeChange?.(timeString);
    
    if (showQuickActions) {
      toast({
        title: "Tijd ingesteld",
        description: `Huidige tijd (afgerond): ${timeString}`,
        duration: 2000,
      });
    }
  }, [onTimeChange, timeStep, showQuickActions, toast]);

  const getDateDisplayText = useCallback(() => {
    if (!selectedDate) return placeholder.date;
    
    if (isToday(selectedDate)) {
      return `Vandaag, ${format(selectedDate, 'd MMMM', { locale: nl })}`;
    }
    
    if (isTomorrow(selectedDate)) {
      return `Morgen, ${format(selectedDate, 'd MMMM', { locale: nl })}`;
    }
    
    return format(selectedDate, 'EEEE d MMMM yyyy', { locale: nl });
  }, [selectedDate, placeholder.date]);

  const isDateValid = selectedDate && selectedDate >= startOfDay(minDate);
  const isTimeValid = selectedTime && timeOptions.some(option => option.value === selectedTime);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Date Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Datum</Label>
        <div className="flex gap-2">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                  isDateValid && "border-green-200 bg-green-50"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateDisplayText()}
                {isDateValid && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 space-y-2" align="start">
              {showQuickActions && (
                <div className="flex gap-2 p-3 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTodayClick}
                    className="text-xs"
                  >
                    Vandaag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTomorrowClick}
                    className="text-xs"
                  >
                    Morgen
                  </Button>
                </div>
              )}
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date < startOfDay(minDate)}
                locale={nl}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Time Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tijd</Label>
        <div className="flex gap-2">
          <Select value={selectedTime || ""} onValueChange={handleTimeSelect}>
            <SelectTrigger 
              className={cn(
                "flex-1",
                isTimeValid && "border-green-200 bg-green-50"
              )}
              disabled={disabled}
            >
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder={placeholder.time} />
                {isTimeValid && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showQuickActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentTimeClick}
              disabled={disabled}
              className="px-3 whitespace-nowrap"
            >
              Nu
            </Button>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {selectedDate && selectedDate < startOfDay(minDate) && (
        <p className="text-sm text-red-600">
          Datum moet vandaag of in de toekomst zijn
        </p>
      )}
      
      {selectedTime && !isTimeValid && (
        <p className="text-sm text-red-600">
          Ongeldige tijd geselecteerd
        </p>
      )}
    </div>
  );
});
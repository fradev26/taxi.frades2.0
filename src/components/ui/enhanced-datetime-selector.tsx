import React, { useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, CheckCircle, X } from "lucide-react";
import { format, addMinutes, setHours, setMinutes, startOfDay, isToday, isTomorrow } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DateTimeSelectorProps {
  date?: Date;
  onDateTimeChange?: (date: Date) => void;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
  showQuickActions?: boolean;
  timeStep?: number;
}

export const EnhancedDateTimeSelector = React.memo(function EnhancedDateTimeSelector({
  date = new Date(),
  onDateTimeChange,
  minDate = new Date(),
  disabled = false,
  className = "",
  showQuickActions = true,
  timeStep = 15
}: DateTimeSelectorProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  // Generate time options
  const timeOptions = React.useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeStep) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({
          value: timeString,
          label: timeString
        });
      }
    }
    return options;
  }, [timeStep]);

  const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve the existing time when changing date
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(date.getHours());
      newDateTime.setMinutes(date.getMinutes());
      
      onDateTimeChange?.(newDateTime);
      setDateOpen(false);
      setIsConfirmed(false);
    }
  }, [date, onDateTimeChange]);

  const handleTimeSelect = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    
    onDateTimeChange?.(newDateTime);
    setTimeOpen(false);
    setIsConfirmed(false);
  }, [date, onDateTimeChange]);

  const handleConfirm = useCallback(() => {
    setIsConfirmed(true);
    toast({
      title: "Datum en tijd bevestigd",
      description: `${format(date, 'EEEE d MMMM yyyy', { locale: nl })} om ${format(date, 'HH:mm')}`,
      duration: 3000,
    });
  }, [date, toast]);

  const handleEdit = useCallback(() => {
    setIsConfirmed(false);
  }, []);

  const getDateDisplayText = useCallback(() => {
    if (isToday(date)) {
      return `Vandaag, ${format(date, 'd MMMM', { locale: nl })}`;
    }
    
    if (isTomorrow(date)) {
      return `Morgen, ${format(date, 'd MMMM', { locale: nl })}`;
    }
    
    return format(date, 'EEEE d MMMM yyyy', { locale: nl });
  }, [date]);

  const getCurrentTime = useCallback(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / timeStep) * timeStep;
    const roundedTime = addMinutes(setMinutes(now, 0), roundedMinutes);
    
    const newDateTime = new Date(date);
    newDateTime.setHours(roundedTime.getHours());
    newDateTime.setMinutes(roundedTime.getMinutes());
    
    onDateTimeChange?.(newDateTime);
    setIsConfirmed(false);
  }, [date, onDateTimeChange, timeStep]);

  if (isConfirmed) {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Datum en tijd bevestigd</span>
              </div>
              <div className="text-sm text-green-700">
                <div className="font-medium">{getDateDisplayText()}</div>
                <div>{format(date, 'HH:mm')}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              Wijzig
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Date Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Datum</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => date < startOfDay(minDate)}
              initialFocus
              locale={nl}
            />
            {showQuickActions && (
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateSelect(new Date())}
                    className="flex-1"
                  >
                    Vandaag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateSelect(addMinutes(new Date(), 24 * 60))}
                    className="flex-1"
                  >
                    Morgen
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tijd</Label>
        <div className="flex gap-2">
          <Select value={format(date, 'HH:mm')} onValueChange={handleTimeSelect}>
            <SelectTrigger className="flex-1" disabled={disabled}>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue />
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
              onClick={getCurrentTime}
              disabled={disabled}
              className="px-3 whitespace-nowrap"
            >
              Nu
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Button */}
      <Button
        onClick={handleConfirm}
        className="w-full"
        disabled={disabled || date < minDate}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Bevestig datum en tijd
      </Button>

      {/* Validation Messages */}
      {date < startOfDay(minDate) && (
        <p className="text-sm text-red-600">
          Datum moet vandaag of in de toekomst zijn
        </p>
      )}
    </div>
  );
});

// Keep the original DateTimeSelector for backward compatibility but enhance it
export const DateTimeSelector = React.memo(function DateTimeSelector({
  date,
  onDateTimeChange,
  ...props
}: { date?: Date; onDateTimeChange?: (date: Date) => void } & Omit<DateTimeSelectorProps, 'date' | 'onDateTimeChange'>) {
  return (
    <EnhancedDateTimeSelector 
      date={date} 
      onDateTimeChange={onDateTimeChange} 
      {...props} 
    />
  );
});
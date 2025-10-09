import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "BE", name: "België", flag: "🇧🇪", dialCode: "+32" },
  { code: "NL", name: "Nederland", flag: "🇳🇱", dialCode: "+31" },
  { code: "FR", name: "Frankrijk", flag: "🇫🇷", dialCode: "+33" },
  { code: "DE", name: "Duitsland", flag: "🇩🇪", dialCode: "+49" },
  { code: "GB", name: "Verenigd Koninkrijk", flag: "🇬🇧", dialCode: "+44" },
  { code: "US", name: "Verenigde Staten", flag: "🇺🇸", dialCode: "+1" },
  { code: "ES", name: "Spanje", flag: "🇪🇸", dialCode: "+34" },
  { code: "IT", name: "Italië", flag: "🇮🇹", dialCode: "+39" },
  { code: "LU", name: "Luxemburg", flag: "🇱🇺", dialCode: "+352" },
  { code: "CH", name: "Zwitserland", flag: "🇨🇭", dialCode: "+41" },
];

interface PhoneInputProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultCountry?: string;
  variant?: 'default' | 'underline';
}

export function PhoneInput({
  id,
  value = "",
  onChange,
  placeholder = "123 456 789",
  className,
  disabled = false,
  defaultCountry = "BE",
  variant = "default"
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  
  const currentCountry = COUNTRY_CODES.find(country => country.code === selectedCountry) || COUNTRY_CODES[0];
  
  // Extract the phone number without country code
  const phoneNumber = value.startsWith(currentCountry.dialCode) 
    ? value.substring(currentCountry.dialCode.length).trim()
    : value;

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const newCountry = COUNTRY_CODES.find(country => country.code === countryCode);
    if (newCountry && onChange) {
      // Keep the existing phone number but change the country code
      const cleanNumber = phoneNumber.replace(/^\+?\d+\s*/, '').trim();
      onChange(`${newCountry.dialCode} ${cleanNumber}`.trim());
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const inputValue = e.target.value;
      // Remove any existing country code from the input
      const cleanNumber = inputValue.replace(/^\+?\d+\s*/, '').trim();
      onChange(`${currentCountry.dialCode} ${cleanNumber}`.trim());
    }
  };

  const containerClasses = variant === 'underline' 
    ? "relative flex items-center border-0 border-b border-border bg-transparent" 
    : "relative flex items-center overflow-hidden rounded-md border border-input bg-background shadow-sm";

  const selectClasses = variant === 'underline'
    ? "w-[140px] h-12 border-0 border-r border-border bg-transparent hover:bg-muted/20 transition-colors rounded-none focus:ring-0 focus:ring-offset-0 px-3"
    : "w-[140px] h-12 border-0 border-r border-border bg-muted/30 hover:bg-muted/50 transition-colors rounded-none focus:ring-2 focus:ring-ring focus:ring-offset-2 px-3";

  const inputClasses = variant === 'underline'
    ? "pl-10 h-12 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
    : "pl-10 h-12 border-0 bg-background rounded-none focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className={cn(containerClasses, className)}>
      <Select
        value={selectedCountry}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className={selectClasses}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{currentCountry.flag}</span>
              <span className="text-sm font-mono font-medium text-foreground">{currentCountry.dialCode}</span>
            </div>
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code} className="cursor-pointer">
              <div className="flex items-center gap-3 py-1">
                <span className="text-xl">{country.flag}</span>
                <span className="font-mono text-sm font-medium min-w-[50px]">{country.dialCode}</span>
                <span className="text-sm text-muted-foreground">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          id={id}
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={handlePhoneChange}
          className={inputClasses}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
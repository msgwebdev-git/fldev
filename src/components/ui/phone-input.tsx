"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> & {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: RPNInput.Country;
};

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, value, defaultCountry = "MD", ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={PhoneInputField}
      smartCaret={false}
      international
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry}
      value={value || undefined}
      onChange={(newValue) => onChange?.(newValue || "")}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

// Кастомный инпут для телефона
const PhoneInputField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 h-12 w-full rounded-r-md border border-l-0 border-input bg-background px-3 py-2 text-base",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "dark:bg-input/30",
      "font-mono tracking-wide",
      className
    )}
    {...props}
  />
));
PhoneInputField.displayName = "PhoneInputField";

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="inline-flex items-center justify-center h-5 w-7 shrink-0 overflow-hidden rounded-sm bg-foreground/10 [&_svg]:h-full [&_svg]:w-full [&_svg]:object-cover">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex gap-1 rounded-l-md rounded-r-none border-r-0 px-3 h-12",
            "bg-background hover:bg-accent",
            "dark:bg-input/30 dark:hover:bg-accent",
            "focus:z-10"
          )}
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search country..."
          />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CommandItem
                      key={value}
                      className="flex items-center gap-2"
                      onSelect={() => {
                        onChange(value);
                        setIsOpen(false);
                      }}
                    >
                      <FlagComponent country={value} countryName={label} />
                      <span className="flex-1 text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                        {`+${RPNInput.getCountryCallingCode(value)}`}
                      </span>
                      {value === selectedCountry && (
                        <CheckIcon className="size-4 shrink-0 text-primary" />
                      )}
                    </CommandItem>
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { PhoneInput };
export type { PhoneInputProps };

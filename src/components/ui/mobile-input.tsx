import * as React from "react";
import { cn } from "@/lib/utils";
import { useKeyboardAware } from "@/hooks/use-keyboard-aware";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

export interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  keyboardAware?: boolean;
  hapticFeedback?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className, 
    type, 
    keyboardAware = false,
    hapticFeedback = true,
    autoCapitalize,
    autoComplete,
    inputMode,
    onFocus,
    onChange,
    ...props 
  }, ref) => {
    const { viewportStyle } = useKeyboardAware({ enabled: keyboardAware });
    const { selection } = useHapticFeedback({ enabled: hapticFeedback });

    // Smart defaults based on input type
    const getSmartDefaults = () => {
      const defaults: Partial<MobileInputProps> = {};
      
      switch (type) {
        case 'email':
          defaults.inputMode = 'email';
          defaults.autoCapitalize = 'none';
          defaults.autoComplete = 'email';
          break;
        case 'tel':
          defaults.inputMode = 'tel';
          defaults.autoComplete = 'tel';
          break;
        case 'url':
          defaults.inputMode = 'url';
          defaults.autoCapitalize = 'none';
          defaults.autoComplete = 'url';
          break;
        case 'search':
          defaults.inputMode = 'search';
          defaults.autoComplete = 'off';
          break;
        case 'number':
          defaults.inputMode = 'numeric';
          defaults.autoComplete = 'off';
          break;
        default:
          defaults.inputMode = inputMode || 'text';
          defaults.autoCapitalize = autoCapitalize || 'sentences';
      }
      
      return defaults;
    };

    const smartDefaults = getSmartDefaults();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (hapticFeedback) {
        selection();
      }
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    return (
      <div style={keyboardAware ? viewportStyle : undefined}>
        <input
          type={type}
          className={cn(
            "mobile-input flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-target",
            className
          )}
          ref={ref}
          autoCapitalize={autoCapitalize || smartDefaults.autoCapitalize}
          autoComplete={autoComplete || smartDefaults.autoComplete}
          inputMode={inputMode || smartDefaults.inputMode}
          onFocus={handleFocus}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";

export { MobileInput };
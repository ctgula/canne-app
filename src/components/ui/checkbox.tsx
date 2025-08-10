import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, id, ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="checkbox"
        aria-checked={!!checked}
        checked={!!checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={[
          // Base box
          'appearance-none',
          'w-5 h-5 rounded-md border-2',
          // Default (unchecked)
          'border-gray-400 bg-white dark:bg-zinc-900 dark:border-gray-500',
          // Focus ring
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          // Transition
          'transition-transform duration-150 ease-out',
          'align-middle select-none',
          // Checked state: bg + border color and checkmark icon
          "checked:bg-violet-600 checked:dark:bg-violet-500 checked:border-violet-600",
          // Hover/focus slight scale for affordance
          'hover:scale-[1.03] focus:scale-[1.03]',
          className
        ].filter(Boolean).join(' ')}
        style={{ WebkitAppearance: 'none' }}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

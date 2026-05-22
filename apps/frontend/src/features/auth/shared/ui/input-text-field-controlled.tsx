'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputTextFieldControlledProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeHolder?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  isIcon?: boolean;
  required?: boolean;
}

export function InputTextFieldControlled<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeHolder,
  icon,
  iconPosition = 'start',
  isIcon = false,
  required = false,
}: InputTextFieldControlledProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? <span className="ml-1 text-red-500">*</span> : null}
          </Label>

          <div className="relative">
            {isIcon && icon && iconPosition === 'start' ? (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                {icon}
              </span>
            ) : null}

            <Input
              id={field.name}
              {...field}
              placeholder={placeHolder}
              aria-invalid={Boolean(fieldState.error)}
              className={isIcon && iconPosition === 'start' ? 'pl-9' : undefined}
            />

            {isIcon && icon && iconPosition === 'end' ? (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                {icon}
              </span>
            ) : null}
          </div>

          {fieldState.error?.message ? (
            <p className="text-xs text-red-500">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}
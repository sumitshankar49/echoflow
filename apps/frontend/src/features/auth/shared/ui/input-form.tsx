'use client';

import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';

type InputFormProps<TFieldValues extends FieldValues> = UseFormReturn<TFieldValues> & {
  children: React.ReactNode;
};

export function InputForm<TFieldValues extends FieldValues>({
  children,
  ...form
}: InputFormProps<TFieldValues>) {
  return <FormProvider {...form}>{children}</FormProvider>;
}
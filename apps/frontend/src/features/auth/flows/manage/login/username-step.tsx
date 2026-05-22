'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  AUTH_ARIA_LABELS,
  AUTH_BUTTON_LABELS,
  AUTH_FIELD_LABELS,
  AUTH_FIELD_PLACEHOLDERS,
  AUTH_LINK_PATHS,
  ICON_SIZES,
} from '@/shared/constants';
import { Icons } from '../../../shared/ui/icons';
import { ButtonLink } from '../../../shared/ui/button-link';
import { FlexStyle } from '../../../shared/ui/flex-style';
import { InputForm } from '../../../shared/ui/input-form';
import { InputTextFieldControlled } from '../../../shared/ui/input-text-field-controlled';
import { UsernameFormSchema, type UsernameFormType } from '../../../shared/domain/auth.schema';

export interface UsernameStepProps {
  defaultValue?: string;
  isPending?: boolean;
  onSubmit: (values: UsernameFormType) => void | Promise<void>;
}

export const UsernameStep: FC<UsernameStepProps> = ({
  defaultValue = '',
  isPending = false,
  onSubmit,
}) => {
  const form = useForm<UsernameFormType>({
    resolver: zodResolver(UsernameFormSchema),
    defaultValues: { username: defaultValue },
  });

  const onFormSubmit = form.handleSubmit((values) => onSubmit(values));

  return (
    <InputForm {...form}>
      <form onSubmit={onFormSubmit} className="relative space-y-4 overflow-x-hidden">
        <InputTextFieldControlled
          control={form.control}
          name="username"
          label={AUTH_FIELD_LABELS.USERNAME}
          placeHolder={AUTH_FIELD_PLACEHOLDERS.USERNAME}
          icon={<Icons.User size={ICON_SIZES.SM} />}
          iconPosition="start"
          isIcon
          required
        />

        <FlexStyle direction="rowReverse" items="default" justify="between">
          <Button
            type="submit"
            aria-label={AUTH_ARIA_LABELS.LOGIN_BUTTON}
            disabled={isPending || !form.formState.isValid}
            size="sm"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {AUTH_BUTTON_LABELS.CONTINUE}
              </span>
            ) : (
              AUTH_BUTTON_LABELS.CONTINUE
            )}
          </Button>

          <ButtonLink
            ariaLabel={AUTH_ARIA_LABELS.FORGOT_PASSWORD}
            disabled={isPending}
            linkPath={`${AUTH_LINK_PATHS.LOGIN_BASE_PATH}${AUTH_LINK_PATHS.FORGOT_PASSWORD}`}
            variant="link"
            label={AUTH_BUTTON_LABELS.FORGOT_PASSWORD}
          />
        </FlexStyle>
      </form>
    </InputForm>
  );
};
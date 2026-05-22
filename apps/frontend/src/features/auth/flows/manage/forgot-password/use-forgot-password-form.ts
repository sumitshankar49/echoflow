'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import { AUTH_ERROR_MESSAGES, AUTH_TOAST_MESSAGES } from '@/shared/constants';

export function useForgotPasswordForm() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authService.forgotPassword(data);
      toast.success(AUTH_TOAST_MESSAGES.FORGOT_PASSWORD_SUCCESS);
      form.reset();
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 429) {
        toast.error(AUTH_ERROR_MESSAGES.FORGOT_PASSWORD_RATE_LIMIT);
        return;
      }

      toast.error(AUTH_ERROR_MESSAGES.FORGOT_PASSWORD_FAILED);
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}
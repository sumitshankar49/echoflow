'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_LINK_PATHS,
  AUTH_TOAST_MESSAGES,
} from '@/shared/constants';

export function useResetPasswordForm(email?: string | null) {
  const router = useRouter();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email ?? '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authService.resetPassword(data);
      toast.success(AUTH_TOAST_MESSAGES.RESET_PASSWORD_SUCCESS);
      router.push(AUTH_LINK_PATHS.LOGIN);
    } catch (error) {
      const apiMessage = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message?.toLowerCase()
        : undefined;

      if (apiMessage?.includes('otp') || apiMessage?.includes('expired') || apiMessage?.includes('invalid')) {
        toast.error(AUTH_ERROR_MESSAGES.RESET_PASSWORD_INVALID_LINK);
        return;
      }

      toast.error(AUTH_ERROR_MESSAGES.RESET_PASSWORD_FAILED);
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}
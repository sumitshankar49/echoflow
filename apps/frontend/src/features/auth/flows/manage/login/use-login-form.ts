'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginSchema, type LoginSchema } from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import { AUTH_ERROR_MESSAGES, AUTH_TOAST_MESSAGES } from '@/shared/constants';
import { useAuthStore } from '@/shared/store/auth.store';
import { getApiErrorMessage } from '@/shared/api/error-message';

export function useLoginForm() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const tokens = await authService.login(data);
      setTokens(tokens.accessToken, tokens.refreshToken);
      toast.success(AUTH_TOAST_MESSAGES.LOGIN_SUCCESS);
      router.push('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, AUTH_ERROR_MESSAGES.LOGIN_FAILED));
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}

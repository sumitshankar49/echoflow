'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { registerSchema, type RegisterSchema } from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_LINK_PATHS,
  AUTH_TOAST_MESSAGES,
} from '@/shared/constants';

export function useRegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authService.register(data);
      toast.success(AUTH_TOAST_MESSAGES.REGISTER_SUCCESS);
      router.push(`${AUTH_LINK_PATHS.LOGIN}?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const message =
        isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? AUTH_ERROR_MESSAGES.REGISTER_FAILED
          : AUTH_ERROR_MESSAGES.REGISTER_FAILED;

      toast.error(message);
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}

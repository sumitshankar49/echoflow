'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { registerSchema, type RegisterSchema } from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import {
  AUTH_ERROR_MESSAGES,
  AUTH_LINK_PATHS,
  AUTH_TOAST_MESSAGES,
} from '@/shared/constants';
import { getApiErrorMessage } from '@/shared/api/error-message';

export function useRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteCircleId = searchParams.get('inviteCircleId') || undefined;
  const inviteEmail = searchParams.get('inviteEmail') || '';

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: inviteEmail, password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await authService.register({
        ...data,
        inviteCircleId,
      });
      toast.success(AUTH_TOAST_MESSAGES.REGISTER_SUCCESS);
      router.push(`${AUTH_LINK_PATHS.LOGIN}?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, AUTH_ERROR_MESSAGES.REGISTER_FAILED));
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}

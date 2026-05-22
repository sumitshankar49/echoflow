'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterSchema } from '../../../shared/domain/auth.schema';
import { authService } from '../../../shared/data/auth.service';
import { useAuthStore } from '@/shared/store/auth.store';

export function useRegisterForm() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const tokens = await authService.register(data);
    setTokens(tokens.accessToken, tokens.refreshToken);
    router.push('/dashboard');
  });

  return { form, onSubmit };
}

'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AUTH_BUTTON_LABELS,
  AUTH_FIELD_LABELS,
  AUTH_FIELD_PLACEHOLDERS,
} from '@/shared/constants';
import { useLoginForm } from './use-login-form';

export function LoginForm() {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const { register, formState: { errors } } = form;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.EMAIL}</Label>
        <Input
          type="email"
          placeholder={AUTH_FIELD_PLACEHOLDERS.EMAIL}
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.PASSWORD}</Label>
        <Input
          type="password"
          placeholder={AUTH_FIELD_PLACEHOLDERS.PASSWORD}
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>
      <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {AUTH_BUTTON_LABELS.SIGNING_IN}
            </span>
          ) : (
            AUTH_BUTTON_LABELS.SIGN_IN
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

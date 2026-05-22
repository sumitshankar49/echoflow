'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AUTH_BUTTON_LABELS,
  AUTH_ERROR_MESSAGES,
  AUTH_FIELD_LABELS,
  AUTH_FIELD_PLACEHOLDERS,
  AUTH_LINK_PATHS,
} from '@/shared/constants';
import { useResetPasswordForm } from './use-reset-password-form';

export function ResetPasswordForm({ token }: { token?: string | null }) {
  const { form, onSubmit, isSubmitting } = useResetPasswordForm(token);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Input type="hidden" {...register('token')} />

      {!token ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          {AUTH_ERROR_MESSAGES.RESET_PASSWORD_MISSING_LINK}{' '}
          <Link href={AUTH_LINK_PATHS.FORGOT_PASSWORD} className="font-semibold underline underline-offset-2">
            {AUTH_BUTTON_LABELS.FORGOT_PASSWORD}
          </Link>
          .
        </p>
      ) : null}

      <div>
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.NEW_PASSWORD}</Label>
        <Input
          type="password"
          placeholder={AUTH_FIELD_PLACEHOLDERS.NEW_PASSWORD}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.CONFIRM_PASSWORD}</Label>
        <Input
          type="password"
          placeholder={AUTH_FIELD_PLACEHOLDERS.CONFIRM_PASSWORD}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {AUTH_BUTTON_LABELS.RESETTING_PASSWORD}
            </span>
          ) : (
            AUTH_BUTTON_LABELS.RESET_PASSWORD
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
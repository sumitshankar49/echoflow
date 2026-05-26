'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import Link from 'next/link';

import { ButtonLoader } from '@/components/common/ButtonLoader';
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

export function ResetPasswordForm({ email }: { email?: string | null }) {
  const { form, onSubmit, isSubmitting } = useResetPasswordForm(email);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
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
      <Input type="hidden" {...register('email')} />

      {!email ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          {AUTH_ERROR_MESSAGES.RESET_PASSWORD_MISSING_LINK}{' '}
          <Link href={AUTH_LINK_PATHS.FORGOT_PASSWORD} className="font-semibold underline underline-offset-2">
            {AUTH_BUTTON_LABELS.FORGOT_PASSWORD}
          </Link>
          .
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.OTP}</Label>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={AUTH_FIELD_PLACEHOLDERS.OTP}
          {...register('otp')}
        />
        {errors.otp && (
          <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="mb-2 block">{AUTH_FIELD_LABELS.NEW_PASSWORD}</Label>
        <Input
          type="password"
          placeholder={AUTH_FIELD_PLACEHOLDERS.NEW_PASSWORD}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
        )}
        <button
          type="button"
          onClick={() => setShowPasswordRules((value) => !value)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200"
        >
          <Info className="h-3.5 w-3.5" />
          Password rules
        </button>
        {showPasswordRules ? (
          <div className="rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-xs text-zinc-600 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300">
            <p className="font-medium">Use a strong password with:</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>At least 8 characters</li>
              <li>At least 1 uppercase letter (A-Z)</li>
              <li>At least 1 lowercase letter (a-z)</li>
              <li>At least 1 number (0-9)</li>
              <li>At least 1 special character (e.g. !@#$%^&*)</li>
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
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
            <ButtonLoader label={AUTH_BUTTON_LABELS.RESETTING_PASSWORD} />
          ) : (
            AUTH_BUTTON_LABELS.RESET_PASSWORD
          )}
        </Button>
      </motion.div>

      {isSubmitting ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          Updating your password and securing your account.
        </motion.p>
      ) : null}
    </motion.form>
  );
}
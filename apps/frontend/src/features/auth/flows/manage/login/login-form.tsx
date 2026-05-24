'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

import { ButtonLoader } from '@/components/common/ButtonLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AUTH_BUTTON_LABELS,
  AUTH_FIELD_LABELS,
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
} from '@/shared/constants';
import { useLoginForm } from './use-login-form';

export function LoginForm() {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const { register, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className="relative">
        <Input
          type="email"
          placeholder=" "
          className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 text-[15px] transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/25 dark:border-white/15 dark:bg-white/5"
          {...register('email')}
        />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-indigo-300">
            {AUTH_FIELD_LABELS.EMAIL}
          </Label>
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder=" "
            className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 pr-11 text-[15px] transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/25 dark:border-white/15 dark:bg-white/5"
            {...register('password')}
          />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-indigo-300">
            {AUTH_FIELD_LABELS.PASSWORD}
          </Label>
          <motion.button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <motion.span
              key={showPassword ? 'hide' : 'show'}
              initial={{ opacity: 0, rotate: -15, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.span>
          </motion.button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900"
          />
          <span>Remember me</span>
        </label>
        <Link
          href={AUTH_LINK_PATHS.FORGOT_PASSWORD}
          className="font-medium text-indigo-600 underline-offset-4 transition hover:underline hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          {AUTH_LINK_TEXT.FORGOT_PASSWORD}
        </Link>
      </div>

      <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 text-white shadow-[0_12px_28px_-12px_rgba(79,70,229,0.75)] hover:from-indigo-500 hover:via-violet-500 hover:to-indigo-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ButtonLoader label={AUTH_BUTTON_LABELS.SIGNING_IN} />
          ) : (
            AUTH_BUTTON_LABELS.SIGN_IN
          )}
        </Button>
      </motion.div>

      {isSubmitting ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          Thinking... Signing you in with a secure session.
        </motion.p>
      ) : null}
    </motion.form>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Info } from 'lucide-react';

import { ButtonLoader } from '@/components/common/ButtonLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AUTH_BUTTON_LABELS,
  AUTH_FIELD_LABELS,
} from '@/shared/constants';
import { useRegisterForm } from './use-register-form';

export function RegisterForm() {
  const { form, onSubmit, isSubmitting } = useRegisterForm();
  const { register, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-4"
      autoComplete="off"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className="relative">
        <Input
          className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 text-[15px] transition-all focus-visible:border-violet-400 focus-visible:ring-violet-400/25 dark:border-white/15 dark:bg-white/5"
          placeholder=" "
          autoComplete="off"
          {...register('name')}
        />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-violet-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-violet-300">
            {AUTH_FIELD_LABELS.NAME}
          </Label>
        </div>
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <div className="relative">
          <Input
            type="email"
            placeholder=" "
            autoComplete="off"
            className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 text-[15px] transition-all focus-visible:border-violet-400 focus-visible:ring-violet-400/25 dark:border-white/15 dark:bg-white/5"
            {...register('email')}
          />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-violet-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-violet-300">
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
            autoComplete="new-password"
            className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 pr-11 text-[15px] transition-all focus-visible:border-violet-400 focus-visible:ring-violet-400/25 dark:border-white/15 dark:bg-white/5"
            {...register('password')}
          />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-violet-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-violet-300">
            {AUTH_FIELD_LABELS.PASSWORD}
          </Label>
          <motion.button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-300"
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
        <button
          type="button"
          onClick={() => setShowPasswordRules((value) => !value)}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-300 dark:hover:text-violet-200"
        >
          <Info className="h-3.5 w-3.5" />
          Password rules
        </button>
        {showPasswordRules ? (
          <div className="mt-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-xs text-zinc-600 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300">
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

      <div>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder=" "
            autoComplete="new-password"
            className="peer h-12 rounded-xl border-zinc-200 bg-white/75 px-3 pt-4 pr-11 text-[15px] transition-all focus-visible:border-violet-400 focus-visible:ring-violet-400/25 dark:border-white/15 dark:bg-white/5"
            {...register('confirmPassword')}
          />
          <Label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs peer-focus:text-violet-600 peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs dark:text-zinc-400 dark:peer-focus:text-violet-300">
            {AUTH_FIELD_LABELS.CONFIRM_PASSWORD}
          </Label>
          <motion.button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-300"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            <motion.span
              key={showConfirmPassword ? 'hide-confirm' : 'show-confirm'}
              initial={{ opacity: 0, rotate: -15, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.span>
          </motion.button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-900"
          defaultChecked
        />
        <span>I agree to the Terms and Privacy Policy</span>
      </label>

      <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 text-white shadow-[0_12px_28px_-12px_rgba(124,58,237,0.75)] hover:from-violet-500 hover:via-indigo-500 hover:to-violet-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ButtonLoader label={AUTH_BUTTON_LABELS.CREATING_ACCOUNT} />
          ) : (
            AUTH_BUTTON_LABELS.CREATE_ACCOUNT
          )}
        </Button>
      </motion.div>

      {isSubmitting ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          Creating your personalized EchoFlow workspace.
        </motion.p>
      ) : null}
    </motion.form>
  );
}

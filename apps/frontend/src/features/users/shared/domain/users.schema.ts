import { z } from 'zod';

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender is required',
  }),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .date('Date must be in YYYY-MM-DD format'),
  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^\+?[0-9]{7,20}$/, 'Enter a valid phone number'),
  relationshipStatus: z.enum(
    [
      'single',
      'in_relationship',
      'engaged',
      'married',
      'complicated',
      'prefer_not_to_say',
    ],
    {
      message: 'Relationship status is required',
    },
  ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'New password must be at most 100 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ProfileSchema = z.infer<typeof profileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
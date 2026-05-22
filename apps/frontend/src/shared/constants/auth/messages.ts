export const AUTH_TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back to EchoFlow',
  REGISTER_SUCCESS: 'Account created. Please sign in.',
  FORGOT_PASSWORD_SUCCESS: 'Reset link sent. Please check your email inbox.',
  RESET_PASSWORD_SUCCESS: 'Password reset successful. Please sign in with your new password.',
} as const;

export const AUTH_ERROR_MESSAGES = {
  LOGIN_FAILED: 'Unable to sign in',
  REGISTER_FAILED: 'Unable to create account',
  FORGOT_PASSWORD_FAILED: 'We could not send the reset link right now. Please try again and check your email.',
  FORGOT_PASSWORD_RATE_LIMIT: 'Too many requests. Please wait a moment, then check your email inbox.',
  RESET_PASSWORD_FAILED: 'Unable to reset password right now. Please try again using the link from your email.',
  RESET_PASSWORD_INVALID_LINK: 'This reset link is invalid or expired. Please request a new link from Forgot password.',
  RESET_PASSWORD_MISSING_LINK: 'Reset link is missing or incomplete. Please request a new link from Forgot password.',
} as const;

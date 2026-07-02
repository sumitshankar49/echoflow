import { isAxiosError } from 'axios';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Extracts a user-facing message from an API error. Backend messages are only
 * surfaced for client errors (4xx) — server errors (5xx) or network failures
 * always fall back to a generic message so internal details never leak to the UI.
 */
export function getApiErrorMessage(error: unknown, fallback: string = GENERIC_ERROR_MESSAGE): string {
  if (!isAxiosError<{ message?: string | string[] }>(error)) {
    return fallback;
  }

  const status = error.response?.status;
  if (!status || status >= 500) {
    return fallback;
  }

  const rawMessage = error.response?.data?.message;
  const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

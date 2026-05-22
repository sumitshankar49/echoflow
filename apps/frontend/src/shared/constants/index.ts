export * from './auth/aria';
export * from './auth/buttons';
export * from './auth/fields';
export * from './auth/links';
export * from './auth/messages';
export * from './auth/pages';
export * from './table/columns';
export * from './ui/icon-sizes';

import { AUTH_ARIA_LABELS } from './auth/aria';
import { AUTH_BUTTON_LABELS } from './auth/buttons';
import { AUTH_LINK_PATHS } from './auth/links';
import { ICON_SIZES } from './ui/icon-sizes';

// Backward-compatible exports for existing imports.
export const ARIA_LABELS = AUTH_ARIA_LABELS;
export const INPUT_ICON_SIZE = ICON_SIZES.SM;
export const USER_LOGIN_FRONT_END_URL_PATH = AUTH_LINK_PATHS.LOGIN_BASE_PATH;
export const CONTINUE_BUTTON_LABEL = AUTH_BUTTON_LABELS.CONTINUE;
export const FORGET_PASSWORD_FORM_BUTTON_LABEL = AUTH_BUTTON_LABELS.FORGOT_PASSWORD;
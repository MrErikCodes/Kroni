// Translate the most common Clerk error codes to the user's locale. Clerk's
// server-side messages come back in English regardless of the SDK
// localization prop (which only covers Clerk-rendered UI). For our custom
// auth forms we map the structured error code to an i18n key under
// auth.clerkErrors.* and fall back to message-substring matching when the
// code is missing or unknown.

import { t } from './i18n';

interface ClerkLikeError {
  errors?: {
    code?: string;
    message?: string;
    longMessage?: string;
    meta?: { paramName?: string };
  }[];
  message?: string;
}

const CODE_TO_KEY: Record<string, string> = {
  form_identifier_not_found: 'auth.clerkErrors.identifierNotFound',
  form_identifier_exists: 'auth.clerkErrors.identifierExists',
  form_password_incorrect: 'auth.clerkErrors.passwordIncorrect',
  form_password_pwned: 'auth.clerkErrors.passwordPwned',
  form_password_length_too_short: 'auth.clerkErrors.passwordTooShort',
  form_password_size_in_bytes_exceeded: 'auth.clerkErrors.passwordTooLong',
  form_password_validation_failed: 'auth.clerkErrors.passwordValidationFailed',
  form_param_format_invalid: 'auth.clerkErrors.formatInvalid',
  form_param_format_invalid__email_address: 'auth.clerkErrors.emailInvalid',
  form_param_nil: 'auth.clerkErrors.fieldRequired',
  form_param_missing: 'auth.clerkErrors.fieldRequired',
  session_exists: 'auth.clerkErrors.sessionExists',
  session_token_expired: 'auth.clerkErrors.sessionExpired',
  network_error: 'auth.clerkErrors.networkError',
  too_many_requests: 'auth.clerkErrors.tooManyRequests',
  resource_not_found: 'auth.clerkErrors.notFound',
  passwd_pwned: 'auth.clerkErrors.passwordPwned',
  verification_expired: 'auth.clerkErrors.verificationExpired',
  verification_failed: 'auth.clerkErrors.verificationFailed',
  verification_already_verified: 'auth.clerkErrors.alreadyVerified',
  form_code_incorrect: 'auth.clerkErrors.codeIncorrect',
};

export function formatClerkError(err: unknown): string {
  const e = err as ClerkLikeError;
  const first = e?.errors?.[0];
  const code = first?.code;
  if (code && CODE_TO_KEY[code]) return t(CODE_TO_KEY[code]);

  // Fall back to longMessage / message and translate inline if it matches a
  // string we know. Clerk sometimes throws a plain Error with a message
  // string instead of the structured shape.
  const raw = first?.longMessage ?? first?.message ?? e?.message ?? '';
  const lc = raw.toLowerCase();
  if (lc.includes('online data breach') || lc.includes('pwned')) {
    return t('auth.clerkErrors.passwordPwned');
  }
  if (lc.includes('not found') && lc.includes('account')) {
    return t('auth.clerkErrors.identifierNotFound');
  }
  if (lc.includes('already exists') || lc.includes('taken')) {
    return t('auth.clerkErrors.identifierExists');
  }
  if (lc.includes('incorrect') && lc.includes('password')) {
    return t('auth.clerkErrors.passwordIncorrect');
  }
  if (lc.includes('too short') || lc.includes('minimum length')) {
    return t('auth.clerkErrors.passwordTooShort');
  }
  if (lc.includes('invalid') && lc.includes('email')) {
    return t('auth.clerkErrors.emailInvalid');
  }
  if (lc.includes('verification') && lc.includes('expired')) {
    return t('auth.clerkErrors.verificationExpired');
  }
  if (lc.includes('incorrect') && lc.includes('code')) {
    return t('auth.clerkErrors.codeIncorrect');
  }
  if (raw) return raw;
  return t('auth.clerkErrors.generic');
}

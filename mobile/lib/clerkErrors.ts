// Translate the most common Clerk error codes to the user's locale. Clerk's
// server-side messages come back in English regardless of the SDK
// localization prop (which only covers Clerk-rendered UI; the unstable__errors
// block leaves form_code_incorrect / verification_failed as `void 0`, so the
// raw English server default leaks through). For our custom auth forms we map
// the structured error code to an i18n key under auth.clerkErrors.* and fall
// back to message-substring matching when the code is missing or unknown.

import { t, getAppLocale } from './i18n';

interface ClerkLikeError {
  errors?: {
    code?: string;
    message?: string;
    longMessage?: string;
    long_message?: string;
    meta?: { paramName?: string };
  }[];
  message?: string;
  longMessage?: string;
}

const CODE_TO_KEY: Record<string, string> = {
  form_identifier_not_found: 'auth.clerkErrors.identifierNotFound',
  form_identifier_exists: 'auth.clerkErrors.identifierExists',
  form_identifier_exists__email_address: 'auth.clerkErrors.identifierExists',
  form_identifier_exists__phone_number: 'auth.clerkErrors.identifierExists',
  form_password_incorrect: 'auth.clerkErrors.passwordIncorrect',
  form_password_or_identifier_incorrect: 'auth.clerkErrors.passwordIncorrect',
  form_password_pwned: 'auth.clerkErrors.passwordPwned',
  form_password_pwned__sign_in: 'auth.clerkErrors.passwordPwned',
  form_password_length_too_short: 'auth.clerkErrors.passwordTooShort',
  form_password_size_in_bytes_exceeded: 'auth.clerkErrors.passwordTooLong',
  form_password_validation_failed: 'auth.clerkErrors.passwordValidationFailed',
  form_password_not_strong_enough: 'auth.clerkErrors.passwordValidationFailed',
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
  verification_failed: 'auth.clerkErrors.codeIncorrect',
  verification_invalid: 'auth.clerkErrors.codeIncorrect',
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
  // string instead of the structured shape, and the FAPI response uses
  // `long_message` (snake_case) on some code paths.
  const raw =
    first?.longMessage ??
    first?.long_message ??
    first?.message ??
    e?.longMessage ??
    e?.message ??
    '';
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
  // Verification-code phrasing varies across Clerk endpoints ("Incorrect code",
  // "Wrong code", "Invalid code", "Code is invalid", "The code you entered is
  // incorrect", "doesn't match", "expired"). Treat any combo of `code` + a
  // negative qualifier as the OTP-incorrect bucket so non-English users don't
  // see the English server default leak through.
  if (lc.includes('code') && (lc.includes('expired') || lc.includes('expir'))) {
    return t('auth.clerkErrors.verificationExpired');
  }
  if (lc.includes('verification') && lc.includes('expired')) {
    return t('auth.clerkErrors.verificationExpired');
  }
  if (
    lc.includes('code') &&
    (lc.includes('incorrect') ||
      lc.includes('wrong') ||
      lc.includes('invalid') ||
      lc.includes("doesn't match") ||
      lc.includes('does not match') ||
      lc.includes('not match') ||
      lc.includes('not valid'))
  ) {
    return t('auth.clerkErrors.codeIncorrect');
  }

  // Unknown Clerk error. Log so we can extend the map next time we see it,
  // and prefer a translated generic message over leaking the English server
  // default. English-locale users still get the specific raw message since
  // it's already in their language.
  if (raw) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[clerkErrors] unmapped Clerk error', {
        code,
        message: first?.message,
        longMessage: first?.longMessage ?? first?.long_message,
        topLevelMessage: e?.message,
      });
    }
    if (getAppLocale() === 'en') return raw;
    return t('auth.clerkErrors.generic');
  }
  return t('auth.clerkErrors.generic');
}

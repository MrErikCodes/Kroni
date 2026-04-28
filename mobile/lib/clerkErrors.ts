// Translate the most common Clerk error codes to Bokmål. Clerk's
// server-side messages come back in English regardless of the SDK
// localization prop (which only covers Clerk-rendered UI). For our
// custom auth forms we map the structured error code to a Norwegian
// string and fall through to a generic message.

interface ClerkLikeError {
  errors?: Array<{
    code?: string;
    message?: string;
    longMessage?: string;
    meta?: { paramName?: string };
  }>;
  message?: string;
}

const CODE_MAP: Record<string, string> = {
  form_identifier_not_found: 'Vi finner ingen konto med denne e-postadressen.',
  form_identifier_exists: 'Det finnes allerede en konto med denne e-postadressen.',
  form_password_incorrect: 'Feil passord. Prøv igjen.',
  form_password_pwned:
    'Dette passordet finnes i en kjent datalekkasje. Velg et annet passord.',
  form_password_length_too_short:
    'Passordet er for kort. Bruk minst 8 tegn.',
  form_password_size_in_bytes_exceeded:
    'Passordet er for langt. Velg et kortere passord.',
  form_password_validation_failed:
    'Passordet oppfyller ikke kravene. Prøv et sterkere passord.',
  form_param_format_invalid: 'Formatet er ugyldig.',
  form_param_format_invalid__email_address: 'Ugyldig e-postadresse.',
  form_param_nil: 'Feltet kan ikke være tomt.',
  form_param_missing: 'Feltet kan ikke være tomt.',
  session_exists: 'Du er allerede logget inn.',
  session_token_expired: 'Økten er utløpt. Logg inn på nytt.',
  network_error: 'Kunne ikke kontakte serveren. Sjekk internettforbindelsen.',
  too_many_requests: 'For mange forsøk. Prøv igjen om litt.',
  resource_not_found: 'Fant ikke det du leter etter.',
  passwd_pwned:
    'Dette passordet finnes i en kjent datalekkasje. Velg et annet passord.',
};

export function formatClerkError(err: unknown): string {
  const e = err as ClerkLikeError;
  const first = e?.errors?.[0];
  const code = first?.code;
  if (code && CODE_MAP[code]) return CODE_MAP[code];

  // Fall back to longMessage / message and translate inline if it matches
  // a string we know. Clerk sometimes throws plain Error with a message
  // string instead of the structured shape.
  const raw =
    first?.longMessage ?? first?.message ?? e?.message ?? '';
  const lc = raw.toLowerCase();
  if (lc.includes('online data breach') || lc.includes('pwned')) {
    return CODE_MAP.form_password_pwned ?? raw;
  }
  if (lc.includes('not found') && lc.includes('account')) {
    return CODE_MAP.form_identifier_not_found ?? raw;
  }
  if (lc.includes('already exists') || lc.includes('taken')) {
    return CODE_MAP.form_identifier_exists ?? raw;
  }
  if (lc.includes('incorrect') && lc.includes('password')) {
    return CODE_MAP.form_password_incorrect ?? raw;
  }
  if (lc.includes('too short') || lc.includes('minimum length')) {
    return CODE_MAP.form_password_length_too_short ?? raw;
  }
  if (lc.includes('invalid') && lc.includes('email')) {
    return CODE_MAP.form_param_format_invalid__email_address ?? raw;
  }
  if (raw) return raw;
  return 'Noe gikk galt. Prøv igjen.';
}

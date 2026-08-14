/**
 * UAE phone handling, shared by the checkout form and the orders API so the
 * browser and the server can never disagree about what a valid number is.
 *
 * The +971 country code is fixed in the UI, so everything here works on the
 * 9-digit local part only (e.g. 501234567).
 */

export const UAE_DIALING_CODE = '+971';
export const UAE_LOCAL_DIGITS = 9;

/** Prefixes actually issued to UAE mobiles. */
const UAE_MOBILE_PREFIXES = ['50', '52', '54', '55', '56', '58'];

/**
 * Reduces anything a shopper types or pastes to the bare local digits —
 * "+971 50 123 4567", "00971501234567" and "0501234567" all become 501234567.
 */
export function toLocalDigits(input: string): string {
  let digits = (input || '').replace(/\D/g, '');

  if (digits.startsWith('00971')) digits = digits.slice(5);
  else if (digits.startsWith('971')) digits = digits.slice(3);

  // Locals often write the trunk prefix: 050... is the same as 50...
  while (digits.startsWith('0')) digits = digits.slice(1);

  return digits.slice(0, UAE_LOCAL_DIGITS);
}

export type PhoneCheck = {
  valid: boolean;
  /** null while the field is still empty — no point nagging before they start. */
  message: string | null;
};

export function checkUaeMobile(local: string): PhoneCheck {
  if (local.length === 0) return { valid: false, message: null };

  if (!local.startsWith('5')) {
    return { valid: false, message: 'UAE mobile numbers start with 5 — for example 50 123 4567.' };
  }

  if (local.length < UAE_LOCAL_DIGITS) {
    const missing = UAE_LOCAL_DIGITS - local.length;
    return {
      valid: false,
      message: `${missing} more digit${missing === 1 ? '' : 's'} needed — a UAE mobile is 9 digits after +971.`,
    };
  }

  if (!UAE_MOBILE_PREFIXES.includes(local.slice(0, 2))) {
    return {
      valid: false,
      message: `${local.slice(0, 2)} is not a UAE mobile prefix. Valid ones are ${UAE_MOBILE_PREFIXES.join(', ')}.`,
    };
  }

  return { valid: true, message: null };
}

/** Groups the local part for display: 501234567 -> "50 123 4567". */
export function formatUaeLocal(local: string): string {
  return [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(Boolean).join(' ');
}

/** Storage/notification format: +971501234567. */
export function toE164(local: string): string {
  return `${UAE_DIALING_CODE}${local}`;
}

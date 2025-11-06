/**
 * Generates a random invite code for squads
 * Format: 6 characters, uppercase letters and numbers
 * Excludes confusing characters: 0, O, 1, I, L
 */
export function generateInviteCode(): string {
  // Character set excluding confusing ones
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const length = 6;

  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Validates an invite code format
 */
export function isValidInviteCode(code: string): boolean {
  if (!code || code.length !== 6) return false;

  const validChars = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  return validChars.test(code);
}

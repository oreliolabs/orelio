/**
 * Cryptographic utilities for Orelio Password hashing and verification
 * using the browser native Web Cryptography API (PBKDF2-HMAC-SHA256).
 */

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

const ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;

/**
 * Derives a secure salt and PBKDF2 hash for a password.
 * Format returned: `${saltHex}:${hashHex}`
 */
export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Cryptography API is not available in this environment');
  }

  let saltBytes: Uint8Array;
  if (saltHex) {
    saltBytes = hexToBuffer(saltHex);
  } else {
    const rawSalt = new Uint8Array(16);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.crypto as any).getRandomValues(rawSalt);
    saltBytes = rawSalt;
  }
  const effectiveSaltHex = saltHex || bufferToHex(saltBytes.buffer as ArrayBuffer);

  const encoder = new TextEncoder();
  const passwordKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      salt: saltBytes as any,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    KEY_LENGTH_BITS
  );

  const hashHex = bufferToHex(derivedBits);
  return `${effectiveSaltHex}:${hashHex}`;
}

/**
 * Verifies a plain text password against a stored `${saltHex}:${hashHex}` string.
 */
export async function verifyPassword(password: string, storedHashString?: string | null): Promise<boolean> {
  if (!storedHashString || typeof storedHashString !== 'string' || !storedHashString.includes(':')) {
    return false;
  }

  const [saltHex, expectedHashHex] = storedHashString.split(':');
  if (!saltHex || !expectedHashHex) {
    return false;
  }

  try {
    const derived = await hashPassword(password, saltHex);
    const [, actualHashHex] = derived.split(':');
    return actualHashHex === expectedHashHex;
  } catch (err) {
    console.error('[crypto] Password verification failed:', err);
    return false;
  }
}

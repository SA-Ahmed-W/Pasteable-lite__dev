import { webcrypto } from "node:crypto";

type CryptoRandom = {
  getRandomValues(array: Uint8Array): Uint8Array;
};

const cryptoObj: CryptoRandom =
  typeof globalThis.crypto !== "undefined"
    ? (globalThis.crypto as CryptoRandom)
    : (webcrypto as CryptoRandom);

const SAFE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";

export interface IDGeneratorOptions {
  alphabet?: string;
  length?: number;
}

/**
 * Generate a cryptographically secure random string from a given alphabet.
 * Uses rejection sampling to ensure uniform distribution.
 */
function generateSecureString(alphabet: string, length: number): string {
  const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
  const step = Math.ceil((1.6 * mask * length) / alphabet.length);

  let id = "";

  while (id.length < length) {
    const bytes = new Uint8Array(step);
    cryptoObj.getRandomValues(bytes);

    for (let i = 0; i < step && id.length < length; i++) {
      const byte = bytes[i] & mask;
      if (alphabet[byte]) {
        id += alphabet[byte];
      }
    }
  }

  return id;
}

/**
 * ID generator using crypto.getRandomValues for secure randomness.
 */
class IDGenerator {
  private alphabet: string;
  private length: number;

  constructor(options: IDGeneratorOptions = {}) {
    const len = options.length ?? 6;
    this.assertValidLength(len);
    this.length = len;

    if (options.alphabet) {
      this.assertValidAlphabet(options.alphabet);
      this.alphabet = options.alphabet;
    } else {
      this.alphabet = SAFE_ALPHABET;
    }
  }

  private assertValidLength(n: number) {
    if (!Number.isInteger(n) || n < 1) {
      throw new TypeError("length must be an integer >= 1");
    }
  }

  private assertValidAlphabet(a: string) {
    if (typeof a !== "string" || a.length < 2) {
      throw new TypeError(
        "alphabet must be a string with at least 2 characters"
      );
    }
    if (new Set(a).size !== a.length) {
      throw new TypeError("alphabet must not contain duplicate characters");
    }
    if (a.length > 1024) {
      throw new TypeError("alphabet is too large");
    }
  }

  generate(length?: number): string {
    const len = length ?? this.length;
    this.assertValidLength(len);
    return generateSecureString(this.alphabet, len);
  }

  static numeric(length = 6) {
    return new IDGenerator({ alphabet: "0123456789", length });
  }

  static alphaNumeric(length = 6) {
    return new IDGenerator({
      alphabet:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      length,
    });
  }

  static urlSafe(length = 6) {
    return new IDGenerator({ length });
  }

  setDefaultLength(length: number) {
    this.assertValidLength(length);
    this.length = length;
  }

  setAlphabet(alphabet?: string) {
    if (alphabet !== undefined) {
      this.assertValidAlphabet(alphabet);
      this.alphabet = alphabet;
    } else {
      this.alphabet = SAFE_ALPHABET;
    }
  }
}

export const defaultIDGenerator = IDGenerator.alphaNumeric();
defaultIDGenerator.setDefaultLength(10);
export { IDGenerator };

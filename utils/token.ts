// utils/token.ts
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // seconds since epoch
  [key: string]: unknown;
}

/**
 * Returns true only if the token exists, decodes cleanly, and hasn't expired.
 * Any decode failure is treated as invalid (fail closed, not open).
 */
export const isTokenValid = (token?: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return false;

    const nowInSeconds = Date.now() / 1000;
    // small buffer so a token that expires in the next few seconds
    // doesn't get treated as valid right before a request fails
    const BUFFER_SECONDS = 10;
    return decoded.exp - BUFFER_SECONDS > nowInSeconds;
  } catch {
    return false;
  }
};

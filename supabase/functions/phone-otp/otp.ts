/** Secure, dependency-free primitives for the phone verification flow. */
export function generateOtp(): string {
  const limit = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return String(value % 1_000_000).padStart(6, "0");
}

export function isValidOtp(value: unknown): value is string {
  return typeof value === "string" && /^\\d{6}$/.test(value);
}

export async function hmacOtp(code: string, secret: string): Promise<string> {
  if (!isValidOtp(code)) throw new Error("invalid_code");
  if (secret.length < 32) throw new Error("server_not_configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(code));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

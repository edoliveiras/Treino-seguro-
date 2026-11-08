import { assertEquals, assertMatch, assertNotEquals, assertRejects } from "jsr:@std/assert";
import { generateOtp, hmacOtp, isValidOtp } from "./otp.ts";

Deno.test("generateOtp always returns six decimal digits", () => {
  for (let i = 0; i < 500; i++) {
    assertMatch(generateOtp(), /^\\d{6}$/);
  }
});

Deno.test("isValidOtp accepts only six-digit strings", () => {
  assertEquals(isValidOtp("000007"), true);
  assertEquals(isValidOtp("123456"), true);
  assertEquals(isValidOtp("12345"), false);
  assertEquals(isValidOtp("1234567"), false);
  assertEquals(isValidOtp(123456), false);
  assertEquals(isValidOtp("12a456"), false);
});

Deno.test("hmacOtp is deterministic and produces a SHA-256 hex digest", async () => {
  const secret = "a-secure-test-secret-with-at-least-32-characters";
  const first = await hmacOtp("001234", secret);
  const second = await hmacOtp("001234", secret);
  assertEquals(first, second);
  assertMatch(first, /^[a-f0-9]{64}$/);
  assertNotEquals(first, await hmacOtp("001235", secret));
});

Deno.test("hmacOtp rejects malformed codes and short secrets", async () => {
  await assertRejects(() => hmacOtp("123", "a-secure-test-secret-with-at-least-32-characters"), Error, "invalid_code");
  await assertRejects(() => hmacOtp("123456", "too-short"), Error, "server_not_configured");
});

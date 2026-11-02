import assert from "node:assert/strict";
import test from "node:test";
import { contactPhoneSchema } from "../src/lib/withdrawal-phone";

test("withdrawal contact accepts Vietnamese mobile numbers and normalizes spacing", () => {
  assert.equal(contactPhoneSchema.parse("0912 345 678"), "0912345678");
  assert.equal(contactPhoneSchema.parse("+84 912 345 678"), "+84912345678");
});

test("withdrawal contact rejects missing or malformed numbers", () => {
  for (const value of ["", "123456", "0212345678", "+8491234567", "09123456789", "091234567a"]) {
    assert.equal(contactPhoneSchema.safeParse(value).success, false, value);
  }
});

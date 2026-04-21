import { describe, expect, it } from "vitest";
import { commissionCents } from "@/lib/stripe";

describe("commission math", () => {
  it("takes 10% of GMV (rounded)", () => {
    expect(commissionCents(45000)).toBe(4500);
    expect(commissionCents(12345)).toBe(1235);
    expect(commissionCents(0)).toBe(0);
  });
});

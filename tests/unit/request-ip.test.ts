import { describe, it, expect } from "vitest";
import { clientIp } from "@/lib/utils/request-ip";

function req(headers: Record<string, string>): Request {
  return new Request("https://afrosmart.app/api/x", { headers });
}

describe("clientIp", () => {
  it("takes the first hop of X-Forwarded-For", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }))).toBe("203.0.113.7");
  });

  it("falls back to X-Real-IP", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
  });

  it("returns 'unknown' when no proxy headers are present", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });

  it("trims and bounds length", () => {
    expect(clientIp(req({ "x-forwarded-for": "  192.0.2.1  " }))).toBe("192.0.2.1");
  });
});

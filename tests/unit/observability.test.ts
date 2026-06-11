import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportError } from "@/lib/observability";

beforeEach(() => {
  // Silence the structured console.error the reporter always emits.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("reportError forwarding", () => {
  it("does not POST when ERROR_WEBHOOK_URL is unset", () => {
    vi.stubEnv("ERROR_WEBHOOK_URL", "");
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null)));
    vi.stubGlobal("fetch", fetchMock);

    reportError(new Error("boom"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs the error payload to the webhook when configured", () => {
    vi.stubEnv("ERROR_WEBHOOK_URL", "https://hook.example/err");
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null)));
    vi.stubGlobal("fetch", fetchMock);

    reportError(new Error("boom"), { uid: "u1" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hook.example/err");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(String(opts.body));
    expect(body.message).toBe("boom");
    expect(body.uid).toBe("u1");
    expect(body.severity).toBe("ERROR");
  });

  it("never throws even if fetch blows up", () => {
    vi.stubEnv("ERROR_WEBHOOK_URL", "https://hook.example/err");
    vi.stubGlobal("fetch", () => {
      throw new Error("network down");
    });

    expect(() => reportError(new Error("boom"))).not.toThrow();
  });
});

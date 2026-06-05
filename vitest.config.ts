import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only. The Firestore security-rules suite (tests/rules) requires the
// Firebase emulator (Java) and is run separately — see package.json `test:rules`.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});

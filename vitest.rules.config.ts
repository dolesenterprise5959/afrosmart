import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Security-rules tests — require the Firestore emulator (Java) and
// @firebase/rules-unit-testing. Run via `npm run test:rules` inside
// `firebase emulators:exec`. Not part of the default `npm test`.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});

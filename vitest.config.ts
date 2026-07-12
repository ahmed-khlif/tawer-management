import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "../PFE_ak/test-results/frontend-unit-coverage",
      include: [
        "src/modules/auth/validation/schemas/auth/sign-in.ts",
        "src/modules/events/validations/event.schema.ts",
        "src/modules/events/utils/location.ts",
        "src/modules/analytics/utils/access.ts",
        "src/modules/auth/utils/role-access.ts",
        "src/modules/users/utils/normalize-optional-phone.ts",
        "src/utils/truncate-decimals.ts"
      ]
    }
  }
});

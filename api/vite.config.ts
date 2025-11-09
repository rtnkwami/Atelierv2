import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          include: ['tests/integration/**/*.ts'],
          name: 'integration tests',
          fileParallelism: false
        }
      },
      {
        extends: true,
        test: {
          include: ['tests/unit/**/*.ts'],
          name: 'unit tests'
        }
      }
    ]
  },
});

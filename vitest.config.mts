import { defineConfig } from "vitest/config";

// Read the "@/..." import alias from tsconfig.json.
export default defineConfig({ resolve: { tsconfigPaths: true } });

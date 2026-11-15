import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [],
    typecheck: {
      enabled: true,
      only: true,
      include: ['src/spec/vitest/text-layout-options-2a75e2.test-d.ts'],
      tsconfig: 'src/spec/text-layout-types-2a75e2.json'
    }
  }
});

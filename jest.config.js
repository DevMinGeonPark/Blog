
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(\.pnpm/)?(some-esm-package|another-esm-package)/)',
    '\.mjs$',
  ],
};

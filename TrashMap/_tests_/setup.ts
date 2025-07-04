/**
 * Jest setup file
 * Global test configuration and mocks
 */

// Global test environment setup
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock global fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock React Native modules that might be imported
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Set up fake timers for consistent testing
beforeEach(() => {
  jest.clearAllTimers();
});

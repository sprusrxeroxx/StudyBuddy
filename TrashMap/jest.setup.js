// Jest setup file
// Global test configuration

// Mock console.log and console.error to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock Firebase environment variables
process.env.EXPO_PUBLIC_APIKEY = 'test-api-key';
process.env.EXPO_PUBLIC_AUTHDOMAIN = 'test-auth-domain';
process.env.EXPO_PUBLIC_PROJECTID = 'test-project-id';
process.env.EXPO_PUBLIC_STORAGEBUCKET = 'test-storage-bucket';
process.env.EXPO_PUBLIC_MESSAGINGSENDERID = 'test-sender-id';
process.env.EXPO_PUBLIC_APPID = 'test-app-id';

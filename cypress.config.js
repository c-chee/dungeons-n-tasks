const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents: (on, config) => {
      // Database reset before test run
      on('before:run', async () => {
        // Reset database by running a seed script or direct MySQL command
        // This will be handled by the npm script before:run
      });
    },
  },
  env: {
    guildCode: null,
    questId: null,
  },
});

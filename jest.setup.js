const originalError = console.error;
console.error = function (message, ...args) {
  if (typeof message === 'string' && message.includes('inside a test was not wrapped in act')) {
    return;
  }
  return originalError.call(console, message, ...args);
};
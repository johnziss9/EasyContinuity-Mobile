import { jest } from '@jest/globals';

const originalError = console.error;
console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0]) || /Warning: An update to.*inside a test was not wrapped in act/.test(args[0])) {
        return;
    }
    originalError.call(console, ...args);
};
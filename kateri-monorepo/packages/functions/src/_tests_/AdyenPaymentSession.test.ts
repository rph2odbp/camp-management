import { createAdyenPaymentSession } from '../src/createAdyenPaymentSession';

// You can use a testing library like jest, and mock Adyen SDK
describe('createAdyenPaymentSession', () => {
  it('should throw error if required data missing', async () => {
    const data = { reference: 'test', amount: null, returnUrl: null };
    const context = {};
    await expect(createAdyenPaymentSession(data, context)).rejects.toThrow();
  });

  // Add more tests: mock Adyen responses, test success, test error handling
});
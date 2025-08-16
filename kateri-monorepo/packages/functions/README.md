# Adyen Integration in Firebase Functions

## Setup

1. **Install dependencies:**
   ```
   yarn add @adyen/api-library dotenv
   ```

2. **Environment config:**
   - Add Adyen credentials to `.env` (for local development).
   - For production, set credentials in Firebase:
     ```
     firebase functions:config:set adyen.api_key="..." adyen.merchant_account="..."
     ```

3. **Deployment**
   - Deploy functions:
     ```
     yarn build && firebase deploy --only functions
     ```

## Usage

Call `createAdyenPaymentSession` from your frontend via Firebase callable function.  
See [Adyen docs](https://docs.adyen.com/api-explorer/#/Checkout/v70/paymentSession) for required parameters.

## Testing

- Run tests with `yarn test`
- Use mocks for Adyen API in your tests.

## Security

- Never expose Adyen API key to client.
- Lock down access to sensitive functions (auth checks recommended).

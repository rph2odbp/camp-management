import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  // ...other config
};

export const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app);
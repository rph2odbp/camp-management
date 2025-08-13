import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKUvHxDd5aL-8Tg5ehOx6sbUE3kR01AE",
  authDomain: "kateri-fbc.firebaseapp.com",
  databaseURL: "https://kateri-fbc-default-rtdb.firebaseio.com",
  projectId: "kateri-fbc",
  storageBucket: "kateri-fbc.appspot.com",
  messagingSenderId: "735578066617",
  appId: "1:735578066617:web:039a3dd64ccb6f04331568",
  measurementId: "G-S9R675JSP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// In a development environment, connect to the emulators
// This code MUST be below the service initializations
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log("Development environment detected. Connecting to emulators.");
  // Note: The ports should match what's in your firebase.json and the emulator startup logs.
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5002);
}

export { app, auth, db, storage, functions };

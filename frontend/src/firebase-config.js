// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"; // Import functions and its emulator connector

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKUvHxDd5aL-8Tg5ehOx6sbUE3kR01AE",
  authDomain: "kateri-fbc.firebaseapp.com",
  projectId: "kateri-fbc",
  storageBucket: "kateri-fbc.firebasestorage.app",
  messagingSenderId: "735578066617",
  appId: "1:735578066617:web:039a3dd64ccb6f04331568"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services we will use
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Initialize functions
const remoteConfig = getRemoteConfig(app);

// Connect to emulators if in a local development environment
if (window.location.hostname === "localhost") {
  console.log("Connecting to local Firebase emulators...");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}


// Set default values for Remote Config
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour cache
remoteConfig.defaultConfig = {
  // Store statuses as a JSON string
  "registration_statuses": JSON.stringify([
    "all",
    "pending deposit",
    "active",
    "waitlisted",
    "complete"
  ]),
  // Feature flag for the hiring process
  "hiring_feature_enabled": true
};


export { app, auth, db, storage, functions, remoteConfig };

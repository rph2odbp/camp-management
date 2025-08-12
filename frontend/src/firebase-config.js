// frontend/src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config";
import { getAnalytics } from "firebase/analytics";

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

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const remoteConfig = getRemoteConfig(app);
export const analytics = getAnalytics(app);
